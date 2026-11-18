import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Minus, Plus, Search } from "lucide-react";
import type { SurahMeta } from "@/lib/quran";

interface VersePickerProps {
  surahs: SurahMeta[];
  surah: number;
  startAyah: number;
  rangeCount: number;
  onChangeSurah: (surah: number) => void;
  onChangeStartAyah: (ayah: number) => void;
  onChangeRange: (count: number) => void;
}

export function VersePicker({
  surahs,
  surah,
  startAyah,
  rangeCount,
  onChangeSurah,
  onChangeStartAyah,
  onChangeRange,
}: VersePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  const currentSurah = useMemo(
    () =>
      surahs.find((s) => s.number === surah) ?? {
        number: surah,
        name: surah === 3 ? "آل عمران" : "سُورَةُ",
        englishName: surah === 3 ? "Aal-i-Imraan" : `Surah ${surah}`,
        englishNameTranslation: "",
        numberOfAyahs: surah === 3 ? 200 : 286,
        revelationType: "Medinan",
      },
    [surahs, surah]
  );

  const maxAyah = Math.max(1, currentSurah.numberOfAyahs);
  const maxRange = Math.max(1, Math.min(5, maxAyah - startAyah + 1));

  useEffect(() => {
    if (startAyah > maxAyah) onChangeStartAyah(1);
    if (rangeCount > maxRange) onChangeRange(maxRange);
  }, [maxAyah, maxRange, startAyah, rangeCount, onChangeStartAyah, onChangeRange]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return surahs;
    return surahs.filter(
      (s) =>
        String(s.number).includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q)
    );
  }, [surahs, query]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
      {/* Searchable Surah Combobox */}
      <div ref={boxRef} className="sm:col-span-6 relative space-y-1">
        <span className="block text-xs text-[var(--text-secondary)]">سورۃ / Surah</span>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label="سورۃ / Surah"
          onClick={() => setOpen((v) => !v)}
          className="w-full inline-flex items-center justify-between gap-2 rounded-2xl glass-1 glass-border-mask px-3 py-2.5 text-sm text-[var(--text-primary)] cursor-pointer"
        >
          <span className="truncate">
            {currentSurah.number} — {currentSurah.name} — {currentSurah.englishName}
          </span>
          <ChevronDown className="w-4 h-4 text-[var(--accent-gold)] shrink-0" aria-hidden="true" />
        </button>

        {open && (
          <div className="absolute z-40 mt-1.5 w-full rounded-2xl glass-2 glass-border-mask p-2 space-y-2 shadow-2xl">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="تلاش کریں / Search surah…"
                aria-label="Search surah"
                autoFocus
                className="w-full rounded-xl bg-[var(--bg-primary)]/80 border border-[var(--border-subtle)] ps-8 pe-3 py-1.5 text-xs text-[var(--text-primary)]"
              />
            </div>
            <ul role="listbox" className="max-h-56 overflow-y-auto space-y-0.5">
              {filtered.map((s) => (
                <li key={s.number}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={s.number === surah}
                    onClick={() => {
                      onChangeSurah(s.number);
                      onChangeStartAyah(1);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full text-start px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      s.number === surah
                        ? "bg-[var(--gold)]/25 text-[var(--accent-gold)] font-semibold"
                        : "text-[var(--text-primary)] hover:bg-[var(--glass-1-bg)]"
                    }`}
                  >
                    {s.number} — {s.name} — {s.englishName}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bounded Ayah Select */}
      <label className="sm:col-span-3 text-xs space-y-1">
        <span className="block text-[var(--text-secondary)]">آیت / Ayah (1–{maxAyah})</span>
        <select
          aria-label="آیت / Ayah"
          value={Math.min(startAyah, maxAyah)}
          onChange={(e) => onChangeStartAyah(Number(e.target.value))}
          className="w-full rounded-2xl glass-1 glass-border-mask bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)]"
        >
          {Array.from({ length: maxAyah }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      {/* Capped 1-5 Range Stepper */}
      <div className="sm:col-span-3 text-xs space-y-1">
        <span className="block text-[var(--text-secondary)]">تعداد / Range (1–{maxRange})</span>
        <div className="inline-flex items-center justify-between w-full rounded-2xl glass-1 glass-border-mask px-2 py-1">
          <button
            type="button"
            aria-label="Decrease range"
            disabled={rangeCount <= 1}
            onClick={() => onChangeRange(Math.max(1, rangeCount - 1))}
            className="w-8 h-8 rounded-xl inline-flex items-center justify-center text-[var(--text-primary)] disabled:opacity-40 cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <span className="text-sm font-semibold text-[var(--accent-gold)]" data-testid="range-value">
            {rangeCount}
          </span>
          <button
            type="button"
            aria-label="Increase range"
            disabled={rangeCount >= maxRange}
            onClick={() => onChangeRange(Math.min(maxRange, rangeCount + 1))}
            className="w-8 h-8 rounded-xl inline-flex items-center justify-center text-[var(--text-primary)] disabled:opacity-40 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
