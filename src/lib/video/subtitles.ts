export interface SubtitleCue {
  index: number;
  startSec: number;
  endSec: number;
  text: string;
}

export function chunkTranslation(text: string, targetWords = 10): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  if (words.length <= targetWords + 2) return [words.join(" ")];

  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const remaining = words.length - i;
    const take = remaining <= targetWords + 2 ? remaining : targetWords;
    chunks.push(words.slice(i, i + take).join(" "));
    i += take;
  }
  return chunks;
}

export function buildSubtitleTimeline(
  chunks: string[],
  startSec: number,
  durationSec: number
): SubtitleCue[] {
  if (chunks.length === 0 || durationSec <= 0) return [];
  const totalWeight = chunks.reduce((sum, c) => sum + Math.max(8, c.length), 0);
  let cursor = startSec;
  return chunks.map((text, idx) => {
    const weight = Math.max(8, text.length);
    const slice = (weight / totalWeight) * durationSec;
    const cue: SubtitleCue = {
      index: idx + 1,
      startSec: cursor,
      endSec: idx === chunks.length - 1 ? startSec + durationSec : cursor + slice,
      text,
    };
    cursor = cue.endSec;
    return cue;
  });
}

function formatTime(sec: number, sep: "," | "."): string {
  const safe = Math.max(0, sec);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = Math.floor(safe % 60);
  const ms = Math.round((safe - Math.floor(safe)) * 1000);
  return (
    `${String(h).padStart(2, "0")}:` +
    `${String(m).padStart(2, "0")}:` +
    `${String(s).padStart(2, "0")}${sep}` +
    `${String(ms).padStart(3, "0")}`
  );
}

export function toSrt(cues: SubtitleCue[]): string {
  return cues
    .map(
      (c) =>
        `${c.index}\n${formatTime(c.startSec, ",")} --> ${formatTime(c.endSec, ",")}\n${c.text}\n`
    )
    .join("\n");
}

export function toVtt(cues: SubtitleCue[]): string {
  const body = cues
    .map(
      (c) =>
        `${formatTime(c.startSec, ".")} --> ${formatTime(c.endSec, ".")}\n${c.text}\n`
    )
    .join("\n");
  return `WEBVTT\n\n${body}`;
}
