export function secureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  if (range <= 0) return min;
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % range);
  const buf = new Uint32Array(1);
  let val = 0;
  do {
    crypto.getRandomValues(buf);
    val = buf[0];
  } while (val >= limit);
  return min + (val % range);
}

export function pickRandomItem<T>(items: readonly T[]): T {
  const idx = secureRandomInt(0, items.length - 1);
  return items[idx];
}

export function deterministicDateIndex(dateStr: string, length: number): number {
  let hash = 2166136261;
  for (let i = 0; i < dateStr.length; i++) {
    hash ^= dateStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
