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
import { getAudioCdnUrl, getAudioProxyUrl, type FetchedAyah } from "@/lib/quran";
import type { PlatformPreset } from "@/config/platforms";
import type { ReciterId } from "@/config/reciters";
import {
  INTRO_SEC,
  OUTRO_SEC,
  buildVerseTimeline,
  type VideoStudioOptions,
} from "./timeline";
import { renderVideoFrame } from "./render";

export interface EncodeProgress {
  pct: number;
  stage: string;
}

async function fetchAudioBuffer(
  ctx: AudioContext,
  globalNumber: number,
  reciter: ReciterId
): Promise<AudioBuffer> {
  const urls = [
    getAudioCdnUrl(globalNumber, reciter),
    getAudioProxyUrl(globalNumber, reciter),
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const arr = await res.arrayBuffer();
      return await ctx.decodeAudioData(arr);
    } catch {
      // try fallback proxy
    }
  }
  throw new Error("Could not fetch recitation audio");
}

function buildPaddedAudioBuffer(
  ctx: AudioContext,
  buffers: AudioBuffer[],
  totalDurationSec: number
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const totalSamples = Math.ceil(totalDurationSec * sampleRate);
  const out = ctx.createBuffer(2, totalSamples, sampleRate);

  let offsetSamples = Math.floor(INTRO_SEC * sampleRate);
  for (const buf of buffers) {
    for (let ch = 0; ch < 2; ch++) {
      const src = buf.getChannelData(Math.min(ch, buf.numberOfChannels - 1));
      const dst = out.getChannelData(ch);
      dst.set(src, Math.min(offsetSamples, Math.max(0, totalSamples - src.length)));
    }
    offsetSamples += buf.length;
  }
  return out;
}

export async function loadRecitationDurations(
  ayahs: FetchedAyah[],
  reciter: ReciterId
): Promise<{ audioBuffers: AudioBuffer[]; durations: number[] }> {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const audioBuffers: AudioBuffer[] = [];
    for (const a of ayahs) {
      audioBuffers.push(await fetchAudioBuffer(ctx, a.globalNumber, reciter));
    }
    return {
      audioBuffers,
      durations: audioBuffers.map((b) => b.duration),
    };
  } finally {
    await ctx.close();
  }
}

export async function loadQrImage(
  ayah: FetchedAyah,
  lang: "ur" | "en"
): Promise<HTMLImageElement | null> {
  try {
    const url = `${BRAND.appUrl}/${lang}/ayah/${ayah.surahNumber}/${ayah.ayahNumber}`;
    const dataUrl = await QRCode.toDataURL(url, {
      width: 220,
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

export async function exportVerseMp4(opts: {
  ayahs: FetchedAyah[];
  preset: PlatformPreset;
  options: VideoStudioOptions;
  reciter: ReciterId;
  lang: "ur" | "en";
  partLabel?: string;
  signal?: AbortSignal;
  onProgress?: (p: EncodeProgress) => void;
}): Promise<{ mp4Blob: Blob; thumbnailBlob: Blob; totalDurationSec: number }> {
  const { ayahs, preset, options, reciter, lang, partLabel, signal, onProgress } =
    opts;

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  onProgress?.({ pct: 5, stage: "Loading recitation audio…" });
  const { audioBuffers, durations } = await loadRecitationDurations(ayahs, reciter);
  const { pages, totalDurationSec } = buildVerseTimeline(
    ayahs,
    durations,
    preset,
    options
  );
  const qrImg = await loadQrImage(ayahs[0], lang);

  const canvas = document.createElement("canvas");
  canvas.width = preset.width;
  canvas.height = preset.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unsupported");

  // Capture thumbnail from the first verse frame
  renderVideoFrame(
    ctx,
    INTRO_SEC + 0.35,
    totalDurationSec,
    pages,
    preset,
    options,
    reciter,
    qrImg,
    partLabel
  );
  const thumbnailBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Thumbnail failed"))),
      "image/png"
    );
  });

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const audioCtx = new AudioCtx();
  const fullAudio = buildPaddedAudioBuffer(audioCtx, audioBuffers, totalDurationSec);
  await audioCtx.close();

  const canAvc = await canEncodeVideo("avc", {
    width: preset.width,
    height: preset.height,
    bitrate: 8_000_000,
  });
  const canAac = await canEncodeAudio("aac", {
    numberOfChannels: 2,
    sampleRate: fullAudio.sampleRate,
    bitrate: 128_000,
  });

  if (canAvc && canAac) {
    onProgress?.({ pct: 12, stage: "Encoding MP4 (WebCodecs)…" });
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

    for (let f = 0; f < totalFrames; f++) {
      if (signal?.aborted) throw new Error("Export cancelled");
      const tSec = f * frameDur;
      renderVideoFrame(
        ctx,
        tSec,
        totalDurationSec,
        pages,
        preset,
        options,
        reciter,
        qrImg,
        partLabel
      );
      await videoSource.add(tSec, frameDur);
      if (f % 15 === 0) {
        onProgress?.({
          pct: 12 + Math.round((f / totalFrames) * 84),
          stage: `Encoding frame ${f}/${totalFrames}…`,
        });
      }
    }

    videoSource.close();
    await output.finalize();
    onProgress?.({ pct: 100, stage: "Ready" });
    return {
      mp4Blob: new Blob([target.buffer!], { type: "video/mp4" }),
      thumbnailBlob,
      totalDurationSec,
    };
  }

  // Fallback 1: MediaRecorder (+ optional single-threaded ffmpeg.wasm transcode to MP4)
  onProgress?.({ pct: 15, stage: "Recording video stream…" });
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
      renderVideoFrame(
        ctx,
        Math.min(elapsed, totalDurationSec),
        totalDurationSec,
        pages,
        preset,
        options,
        reciter,
        qrImg,
        partLabel
      );
      onProgress?.({
        pct: 15 + Math.min(70, Math.round((elapsed / totalDurationSec) * 70)),
        stage: "Recording video…",
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
    onProgress?.({ pct: 100, stage: "Ready" });
    return { mp4Blob: recordedBlob, thumbnailBlob, totalDurationSec };
  }

  // Fallback 2: lazy-load single-threaded @ffmpeg/ffmpeg to transcode WebM -> MP4
  onProgress?.({ pct: 88, stage: "Transcoding WebM to MP4…" });
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
  onProgress?.({ pct: 100, stage: "Ready" });
  return {
    mp4Blob: new Blob([bytes.buffer], { type: "video/mp4" }),
    thumbnailBlob,
    totalDurationSec,
  };
}
