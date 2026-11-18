import { useEffect, useRef, useState } from "react";
import { Mic, Play, RotateCcw, Square } from "lucide-react";

interface VoiceRecorderProps {
  promptText: string;
  isUrdu: boolean;
  onRecorded: (data: {
    blob: Blob;
    url: string;
    durationSec: number;
    trimStartSec: number;
    trimEndSec: number;
  } | null) => void;
}

export function VoiceRecorder({
  promptText,
  isUrdu,
  onRecorded,
}: VoiceRecorderProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [durationSec, setDurationSec] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  const startCapture = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // 3-2-1 countdown
      for (const n of [3, 2, 1]) {
        setCountdown(n);
        await new Promise((r) => setTimeout(r, 750));
      }
      setCountdown(null);

      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        const dur = Math.max(0.5, (Date.now() - startedAtRef.current) / 1000);
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
        setDurationSec(dur);
        setTrimStart(0);
        setTrimEnd(dur);
        onRecorded({
          blob,
          url,
          durationSec: dur,
          trimStartSec: 0,
          trimEndSec: dur,
        });
        stream.getTracks().forEach((t) => t.stop());
      };

      startedAtRef.current = Date.now();
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch {
      setCountdown(null);
      setError(
        isUrdu
          ? "مائیکروفون تک رسائی نہیں مل سکی۔ براہِ کرم اجازت دیں۔"
          : "Microphone access denied."
      );
    }
  };

  const stopCapture = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleRetake = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setRecordedBlob(null);
    setDurationSec(0);
    onRecorded(null);
  };

  const updateTrim = (nextStart: number, nextEnd: number) => {
    const s = Math.max(0, Math.min(nextStart, nextEnd - 0.3));
    const e = Math.min(durationSec, Math.max(nextEnd, s + 0.3));
    setTrimStart(s);
    setTrimEnd(e);
    if (recordedBlob && recordedUrl) {
      onRecorded({
        blob: recordedBlob,
        url: recordedUrl,
        durationSec,
        trimStartSec: s,
        trimEndSec: e,
      });
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border-gold)]/40 bg-[var(--bg-primary)]/60 p-3.5 space-y-3">
      <div className="text-xs text-[var(--text-secondary)] font-urdu-nastaliq leading-loose max-h-28 overflow-y-auto rounded-lg bg-[var(--bg-card)] p-2.5 border border-[var(--border-subtle)]">
        {promptText}
      </div>

      {countdown !== null && (
        <div className="text-center py-2 text-2xl font-bold text-[var(--accent-gold)]">
          {countdown}
        </div>
      )}

      {error && <p className="text-xs text-red-300">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        {!recording && !recordedUrl && (
          <button
            type="button"
            onClick={startCapture}
            disabled={countdown !== null}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-xs"
          >
            <Mic className="w-3.5 h-3.5" aria-hidden="true" />
            {isUrdu ? "ریکارڈنگ شروع کریں" : "Start Recording"}
          </button>
        )}

        {recording && (
          <button
            type="button"
            onClick={stopCapture}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white font-semibold text-xs"
          >
            <Square className="w-3.5 h-3.5" aria-hidden="true" />
            {isUrdu ? "روکیں" : "Stop"}
          </button>
        )}

        {recordedUrl && (
          <>
            <audio controls src={recordedUrl} className="h-9 max-w-[210px]" />
            <button
              type="button"
              onClick={handleRetake}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              {isUrdu ? "دوبارہ" : "Retake"}
            </button>
          </>
        )}
      </div>

      {recordedUrl && durationSec > 0.5 && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="space-y-1">
            <span>Trim Start ({trimStart.toFixed(1)}s)</span>
            <input
              type="range"
              min={0}
              max={Math.max(0.1, durationSec - 0.3)}
              step={0.1}
              value={trimStart}
              onChange={(e) => updateTrim(Number(e.target.value), trimEnd)}
              className="w-full accent-[#C9A227]"
            />
          </label>
          <label className="space-y-1">
            <span>Trim End ({trimEnd.toFixed(1)}s)</span>
            <input
              type="range"
              min={0.3}
              max={durationSec}
              step={0.1}
              value={trimEnd}
              onChange={(e) => updateTrim(trimStart, Number(e.target.value))}
              className="w-full accent-[#C9A227]"
            />
          </label>
        </div>
      )}
    </div>
  );
}
