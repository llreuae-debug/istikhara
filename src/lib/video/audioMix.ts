export const VOICEOVER_GAP_SEC = 0.6;
export const TARGET_LUFS = -16;
export const PEAK_LIMIT_LINEAR = 0.89125; // -1 dBTP

export interface MasterMixResult {
  buffer: AudioBuffer;
  recitationEndSec: number;
  voiceoverStartSec: number;
  voiceoverEndSec: number;
  totalDurationSec: number;
  /** Smoothed 0..1 amplitude envelope sampled at 30fps for audio-reactive glow */
  envelope30fps: Float32Array;
}

/**
 * Estimates integrated loudness (LUFS approximation via RMS in dBFS) of an AudioBuffer.
 */
export function estimateBufferLufs(buf: AudioBuffer): number {
  let sumSq = 0;
  let totalSamples = 0;
  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      sumSq += data[i] * data[i];
    }
    totalSamples += data.length;
  }
  if (totalSamples === 0 || sumSq <= 1e-12) return -70;
  const rms = Math.sqrt(sumSq / totalSamples);
  return 20 * Math.log10(rms) - 0.691;
}

/**
 * Normalizes Float32Array PCM samples to target LUFS (-16) and soft-limits peaks at -1 dBTP.
 */
export function normalizeSegmentGain(
  samples: Float32Array,
  currentLufs: number,
  targetLufs = TARGET_LUFS
): Float32Array {
  const out = new Float32Array(samples.length);
  if (currentLufs <= -65) return out;
  const diffDb = Math.max(-18, Math.min(18, targetLufs - currentLufs));
  const gain = Math.pow(10, diffDb / 20);
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i] * gain;
    // Soft knee limiting at -1 dBTP
    if (v > PEAK_LIMIT_LINEAR) {
      out[i] = PEAK_LIMIT_LINEAR * Math.tanh(v / PEAK_LIMIT_LINEAR);
    } else if (v < -PEAK_LIMIT_LINEAR) {
      out[i] = -PEAK_LIMIT_LINEAR * Math.tanh(-v / PEAK_LIMIT_LINEAR);
    } else {
      out[i] = v;
    }
  }
  return out;
}

function normalizeAudioBuffer(
  ctx: BaseAudioContext,
  buf: AudioBuffer
): AudioBuffer {
  const lufs = estimateBufferLufs(buf);
  const out = ctx.createBuffer(
    buf.numberOfChannels,
    buf.length,
    buf.sampleRate
  );
  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    out
      .getChannelData(ch)
      .set(normalizeSegmentGain(buf.getChannelData(ch), lufs));
  }
  return out;
}

/**
 * Slices an AudioBuffer to [trimStartSec, trimEndSec] and normalizes it.
 */
export function trimAudioBuffer(
  ctx: BaseAudioContext,
  buf: AudioBuffer,
  trimStartSec = 0,
  trimEndSec?: number
): AudioBuffer {
  const sr = buf.sampleRate;
  const startSample = Math.max(0, Math.floor(trimStartSec * sr));
  const endSample = Math.min(
    buf.length,
    trimEndSec !== undefined ? Math.ceil(trimEndSec * sr) : buf.length
  );
  const len = Math.max(1, endSample - startSample);
  const sliced = ctx.createBuffer(buf.numberOfChannels, len, sr);
  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    sliced
      .getChannelData(ch)
      .set(buf.getChannelData(ch).subarray(startSample, endSample));
  }
  return sliced;
}

/**
 * Computes a smoothed 30fps RMS envelope (0..1) from a master AudioBuffer.
 */
export function computeSmoothedEnvelope30fps(buf: AudioBuffer): Float32Array {
  const fps = 30;
  const totalFrames = Math.max(1, Math.ceil(buf.duration * fps));
  const env = new Float32Array(totalFrames);
  const samplesPerFrame = Math.max(1, Math.floor(buf.sampleRate / fps));
  const ch0 = buf.getChannelData(0);

  let prev = 0;
  for (let f = 0; f < totalFrames; f++) {
    const start = f * samplesPerFrame;
    const end = Math.min(ch0.length, start + samplesPerFrame);
    let sumSq = 0;
    for (let i = start; i < end; i++) {
      sumSq += ch0[i] * ch0[i];
    }
    const rms = end > start ? Math.sqrt(sumSq / (end - start)) : 0;
    const norm = Math.min(1, rms * 3.2);
    // Smooth EMA so background glow never flashes
    prev = prev * 0.8 + norm * 0.2;
    env[f] = prev;
  }
  return env;
}

/**
 * Assembles one master stereo track at 48kHz using OfflineAudioContext:
 * intro (1.5s) -> recitation (0.4s gaps) -> [0.6s gap -> Urdu voiceover] -> outro (2.5s).
 * Strictly zero overlap between recitation and voiceover, and zero music.
 */
export async function buildMasterAudioMix(params: {
  recitationBuffers: AudioBuffer[];
  ayahGapSec: number;
  introSec: number;
  outroSec: number;
  voiceoverBuffer?: AudioBuffer | null;
  sampleRate?: number;
}): Promise<MasterMixResult> {
  const sampleRate = params.sampleRate ?? 48000;
  let recitationDur = 0;
  for (let i = 0; i < params.recitationBuffers.length; i++) {
    recitationDur += params.recitationBuffers[i].duration;
    if (i < params.recitationBuffers.length - 1) {
      recitationDur += params.ayahGapSec;
    }
  }

  const recitationEndSec = params.introSec + recitationDur;
  const voiceoverStartSec = params.voiceoverBuffer
    ? recitationEndSec + VOICEOVER_GAP_SEC
    : recitationEndSec;
  const voiceoverEndSec = params.voiceoverBuffer
    ? voiceoverStartSec + params.voiceoverBuffer.duration
    : recitationEndSec;
  const totalDurationSec = Math.max(
    params.introSec + params.outroSec + 0.5,
    voiceoverEndSec + params.outroSec
  );

  const totalSamples = Math.ceil(totalDurationSec * sampleRate);
  const offline = new OfflineAudioContext(2, totalSamples, sampleRate);

  let cursor = params.introSec;
  for (let i = 0; i < params.recitationBuffers.length; i++) {
    const normBuf = normalizeAudioBuffer(offline, params.recitationBuffers[i]);
    const src = offline.createBufferSource();
    src.buffer = normBuf;
    src.connect(offline.destination);
    src.start(cursor);
    cursor += normBuf.duration;
    if (i < params.recitationBuffers.length - 1) {
      cursor += params.ayahGapSec;
    }
  }

  if (params.voiceoverBuffer) {
    const normVo = normalizeAudioBuffer(offline, params.voiceoverBuffer);
    const voSrc = offline.createBufferSource();
    voSrc.buffer = normVo;
    voSrc.connect(offline.destination);
    voSrc.start(voiceoverStartSec);
  }

  const rendered = await offline.startRendering();
  return {
    buffer: rendered,
    recitationEndSec,
    voiceoverStartSec,
    voiceoverEndSec,
    totalDurationSec,
    envelope30fps: computeSmoothedEnvelope30fps(rendered),
  };
}
