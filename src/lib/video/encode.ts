import QRCode from "qrcode";
import {
  AudioBufferSource,
  BufferTarget,
  CanvasSource,
  Mp4OutputFormat,
  Output,
  canEncodeAudio,
  canEncodeVideo,
} from "mediabunny";
import { BRAND } from "@/brand";
import { ensureFontsLoaded } from "@/config/fonts";
import { getAudioCdnUrl, getAudioProxyUrl, type FetchedAyah } from "@/lib/quran";
import { VIDEO_HEIGHT, VIDEO_WIDTH } from "@/config/platforms916";
import { getEveryAyahUrl, getReciterConfig, type ReciterId } from "@/config/reciters";
import { loadSurahTimings, loadSurahWordsUr, tokenizeQuranWords } from "./wordTiming";
import { buildMasterAudioMix } from "./audioMix";
import { shapeWordToGlyphPaths } from "./harfbuzzWrite";
import {
  AYAH_GAP_SEC,
  INTRO_SEC,
  build916Timeline,
  type Studio916Options,
} from "./timeline";
import { render916Frame, type RenderExtras } from "./render";

export interface EncodeProgress {
  pct: number;
  etaSec: number;
  stage: string;
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const onParentAbort = () => ctrl.abort();
  signal?.addEventListener("abort", onParentAbort, { once: true });
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onParentAbort);
  }
}

async function fetchAudioBuffer(
  ctx: AudioContext,
  ayah: FetchedAyah,
  reciter: ReciterId,
  signal?: AbortSignal
): Promise<AudioBuffer> {
  // Fast per-ayah MP3s first (everyayah has CORS *, /api/audio proxies with CORS)
  const urls = [
    getEveryAyahUrl(reciter, ayah.surahNumber, ayah.ayahNumber),
    getAudioProxyUrl(ayah.globalNumber, reciter),
    getAudioCdnUrl(ayah.globalNumber, reciter),
  ];
  for (const url of urls) {
    if (signal?.aborted) throw new Error("Export cancelled");
    try {
      const res = await fetchWithTimeout(url, 12_000, signal);
      if (!res.ok) continue;
      const arr = await res.arrayBuffer();
      if (arr.byteLength < 512) continue;
      return await ctx.decodeAudioData(arr);
    } catch {
      if (signal?.aborted) throw new Error("Export cancelled");
      // try next fallback
    }
  }
  throw new Error("Could not fetch recitation audio");
}

function buildFullAudioBuffer(
  ctx: AudioContext,
  buffers: AudioBuffer[],
  recitationEndSec: number,
  totalDurationSec: number,
  options: Studio916Options
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const totalSamples = Math.ceil(totalDurationSec * sampleRate);
  const out = ctx.createBuffer(2, totalSamples, sampleRate);

  const writeBuffers = (startSec: number, gain: number, maxEndSec: number) => {
    let offset = Math.floor(startSec * sampleRate);
    const limitSample = Math.floor(maxEndSec * sampleRate);
    for (let i = 0; i < buffers.length; i++) {
      const buf = buffers[i];
      for (let ch = 0; ch < 2; ch++) {
        const src = buf.getChannelData(Math.min(ch, buf.numberOfChannels - 1));
        const dst = out.getChannelData(ch);
        const writable = Math.min(src.length, Math.max(0, limitSample - offset));
        for (let s = 0; s < writable; s++) {
          dst[offset + s] += src[s] * gain;
        }
      }
      offset += buf.length + Math.floor(AYAH_GAP_SEC * sampleRate);
      if (offset >= limitSample) break;
    }
  };

  // Primary recitation
  writeBuffers(INTRO_SEC, 1.0, totalDurationSec);

  // Optional 50%-volume recitation repeat under tafseer pages
  if (options.tafseerAudio === "repeat_50" && recitationEndSec < totalDurationSec - 2.5) {
    const outroStart = totalDurationSec - 2.5;
    let cursor = recitationEndSec;
    const singleCycleSec =
      buffers.reduce((s, b) => s + b.duration, 0) +
      Math.max(0, buffers.length - 1) * AYAH_GAP_SEC;
    while (cursor < outroStart && singleCycleSec > 0.5) {
      writeBuffers(cursor, 0.5, outroStart);
      cursor += singleCycleSec + 0.5;
    }
  }

  return out;
}

export async function loadQrImage916(
  ayah: FetchedAyah
): Promise<HTMLImageElement | null> {
  try {
    const url = `${BRAND.appUrl}/ur/ayah/${ayah.surahNumber}/${ayah.ayahNumber}`;
    const dataUrl = await QRCode.toDataURL(url, {
      width: 240,
      margin: 1,
      color: { dark: "#0A1A2F", light: "#F7F1E3" },
    });
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  } catch {
    return null;
  }
}

export async function loadRecitationBuffers(
  ayahs: FetchedAyah[],
  reciter: ReciterId,
  signal?: AbortSignal
): Promise<{ audioBuffers: AudioBuffer[]; durations: number[] }> {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const audioBuffers: AudioBuffer[] = [];
    for (const a of ayahs) {
      audioBuffers.push(await fetchAudioBuffer(ctx, a, reciter, signal));
    }
    return {
      audioBuffers,
      durations: audioBuffers.map((b) => b.duration),
    };
  } finally {
    await ctx.close();
  }
}

export async function export916Mp4(opts: {
  ayahs: FetchedAyah[];
  selectedTafseerParagraphs: string[];
  options: Studio916Options;
  reciter: ReciterId;
  partLabel?: string;
  voiceover?: { buffer: AudioBuffer; text: string } | null;
  extras?: RenderExtras;
  signal?: AbortSignal;
  onProgress?: (p: EncodeProgress) => void;
}): Promise<{ mp4Blob: Blob; coverBlob: Blob; totalDurationSec: number }> {
  const {
    ayahs,
    selectedTafseerParagraphs,
    options,
    reciter,
    partLabel,
    voiceover,
    extras,
    signal,
    onProgress,
  } = opts;

  await ensureFontsLoaded();

  // Pre-shape HarfBuzz glyph paths for doodle_write / qalam_write
  if (options.handStyle === "doodle_write" || options.handStyle === "qalam_write") {
    onProgress?.({ pct: 3, etaSec: 0, stage: "خطاطی شیپنگ تیار ہو رہی ہے…" });
    const allTokens = ayahs.flatMap((a) => tokenizeQuranWords(a.arabicText));
    await Promise.all(
      allTokens.map((w) => shapeWordToGlyphPaths(w, options.script ?? "indopak"))
    );
  }

  onProgress?.({ pct: 5, etaSec: 0, stage: "تلاوت لوڈ ہو رہی ہے…" });
  const { audioBuffers, durations } = await loadRecitationBuffers(ayahs, reciter, signal);
  const ayahWordData = await Promise.all(
    ayahs.map(async (a) => {
      const [tFile, wUr] = await Promise.all([
        loadSurahTimings(reciter, a.surahNumber),
        options.wordByWordMeaning ? loadSurahWordsUr(a.surahNumber) : Promise.resolve(null),
      ]);
      return {
        entry: tFile?.ayahs.find((x) => x.ayah === a.ayahNumber) ?? null,
        meaningsUr: wUr?.[String(a.ayahNumber)] ?? [],
      };
    })
  );

  onProgress?.({ pct: 8, etaSec: 0, stage: "آڈیو مکس اور نارملائزیشن…" });
  const masterMix = await buildMasterAudioMix({
    recitationBuffers: audioBuffers,
    ayahGapSec: AYAH_GAP_SEC,
    introSec: INTRO_SEC,
    outroSec: 2.5,
    voiceoverBuffer: voiceover?.buffer ?? null,
  });

  const { frames, totalDurationSec } = build916Timeline(
    ayahs,
    durations,
    selectedTafseerParagraphs,
    options,
    ayahWordData,
    voiceover
      ? { text: voiceover.text, durationSec: voiceover.buffer.duration }
      : undefined
  );
  const qrImg = await loadQrImage916(ayahs[0]);

  const canvas = document.createElement("canvas");
  canvas.width = VIDEO_WIDTH;
  canvas.height = VIDEO_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unsupported");

  // Capture 1080x1920 cover image (first verse frame, centered in 3:4 area)
  render916Frame(
    ctx,
    INTRO_SEC + 0.3,
    totalDurationSec,
    frames,
    options,
    reciter,
    qrImg,
    partLabel,
    0,
    extras
  );
  const coverBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Cover failed"))),
      "image/png"
    );
  });

  const fullAudio = masterMix.buffer;

  const canAvc = await canEncodeVideo("avc", {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    bitrate: 8_000_000,
  });
  const canAac = await canEncodeAudio("aac", {
    numberOfChannels: 2,
    sampleRate: fullAudio.sampleRate,
    bitrate: 128_000,
  });

  const startedAt = performance.now();

  if (canAvc && canAac) {
    onProgress?.({ pct: 12, etaSec: 15, stage: "MP4 انکوڈنگ جاری ہے…" });
    const target = new BufferTarget();
    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: "in-memory" }),
      target,
    });

    const videoSource = new CanvasSource(canvas, {
      codec: "avc",
      bitrate: 8_000_000,
    });
    const audioSource = new AudioBufferSource({
      codec: "aac",
      bitrate: 128_000,
    });

    output.addVideoTrack(videoSource, { frameRate: 30 });
    output.addAudioTrack(audioSource);

    await output.start();
    await audioSource.add(fullAudio);
    audioSource.close();

    const fps = 30;
    const frameDur = 1 / fps;
    const totalFrames = Math.ceil(totalDurationSec * fps);
    const videoBg =
      typeof HTMLVideoElement !== "undefined" &&
      extras?.mediaSource instanceof HTMLVideoElement
        ? extras.mediaSource
        : null;
    if (videoBg && !videoBg.paused) {
      videoBg.pause();
    }

    for (let f = 0; f < totalFrames; f++) {
      if (signal?.aborted) throw new Error("Export cancelled");
      const tSec = f * frameDur;
      if (videoBg && Number.isFinite(videoBg.duration) && videoBg.duration > 0) {
        const targetTime = tSec % Math.max(0.1, videoBg.duration);
        if (Math.abs(videoBg.currentTime - targetTime) > 0.015) {
          await new Promise<void>((resolve) => {
            const timer = setTimeout(() => {
              videoBg.removeEventListener("seeked", onSeeked);
              resolve();
            }, 150);
            const onSeeked = () => {
              clearTimeout(timer);
              videoBg.removeEventListener("seeked", onSeeked);
              resolve();
            };
            videoBg.addEventListener("seeked", onSeeked, { once: true });
            videoBg.currentTime = targetTime;
          });
        }
      }
      render916Frame(
        ctx,
        tSec,
        totalDurationSec,
        frames,
        options,
        reciter,
        qrImg,
        partLabel,
        masterMix.envelope30fps[f] ?? 0,
        extras
      );
      await videoSource.add(tSec, frameDur);
      if (f % 15 === 0 && f > 0) {
        const elapsed = (performance.now() - startedAt) / 1000;
        const rate = f / elapsed;
        const etaSec = Math.max(0, Math.round((totalFrames - f) / Math.max(1, rate)));
        onProgress?.({
          pct: 12 + Math.round((f / totalFrames) * 84),
          etaSec,
          stage: `فریم ${f}/${totalFrames}…`,
        });
      }
    }

    videoSource.close();
    await output.finalize();
    onProgress?.({ pct: 100, etaSec: 0, stage: "تیار!" });
    return {
      mp4Blob: new Blob([target.buffer!], { type: "video/mp4" }),
      coverBlob,
      totalDurationSec,
    };
  }

  // Fallback 1: MediaRecorder (+ optional single-threaded ffmpeg.wasm transcode)
  onProgress?.({ pct: 15, etaSec: Math.round(totalDurationSec), stage: "ویڈیو ریکارڈ ہو رہی ہے…" });
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const recCtx = new AudioCtx();
  const dest = recCtx.createMediaStreamDestination();
  const srcNode = recCtx.createBufferSource();
  srcNode.buffer = fullAudio;
  srcNode.connect(dest);

  const canvasStream = canvas.captureStream(30);
  const combined = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...dest.stream.getAudioTracks(),
  ]);

  const mime = MediaRecorder.isTypeSupported("video/mp4")
    ? "video/mp4"
    : "video/webm;codecs=vp8,opus";
  const recorder = new MediaRecorder(combined, { mimeType: mime });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const recordedBlob = await new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
    recorder.onerror = () => reject(new Error("MediaRecorder failed"));
    recorder.start(250);
    srcNode.start();

    const startMs = performance.now();
    const step = () => {
      if (signal?.aborted) {
        recorder.stop();
        srcNode.stop();
        reject(new Error("Export cancelled"));
        return;
      }
      const elapsed = (performance.now() - startMs) / 1000;
      render916Frame(
        ctx,
        Math.min(elapsed, totalDurationSec),
        totalDurationSec,
        frames,
        options,
        reciter,
        qrImg,
        partLabel
      );
      onProgress?.({
        pct: 15 + Math.min(70, Math.round((elapsed / totalDurationSec) * 70)),
        etaSec: Math.max(0, Math.round(totalDurationSec - elapsed)),
        stage: "ریکارڈنگ جاری ہے…",
      });
      if (elapsed < totalDurationSec) {
        requestAnimationFrame(step);
      } else {
        recorder.stop();
        srcNode.stop();
      }
    };
    requestAnimationFrame(step);
  });
  await recCtx.close();

  if (mime.includes("mp4")) {
    onProgress?.({ pct: 100, etaSec: 0, stage: "تیار!" });
    return { mp4Blob: recordedBlob, coverBlob, totalDurationSec };
  }

  // Fallback 2: lazy-load single-threaded @ffmpeg/ffmpeg
  onProgress?.({ pct: 88, etaSec: 8, stage: "MP4 میں تبدیل ہو رہی ہے…" });
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { fetchFile } = await import("@ffmpeg/util");
  const ffmpeg = new FFmpeg();
  await ffmpeg.load();
  await ffmpeg.writeFile("in.webm", await fetchFile(recordedBlob));
  await ffmpeg.exec(["-i", "in.webm", "-c:v", "libx264", "-c:a", "aac", "out.mp4"]);
  const outData = await ffmpeg.readFile("out.mp4");
  const bytes =
    typeof outData === "string"
      ? new TextEncoder().encode(outData)
      : new Uint8Array(outData);
  onProgress?.({ pct: 100, etaSec: 0, stage: "تیار!" });
  return {
    mp4Blob: new Blob([bytes.buffer], { type: "video/mp4" }),
    coverBlob,
    totalDurationSec,
  };
}
