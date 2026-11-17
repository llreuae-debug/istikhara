import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
}

export function FaqAccordion({
  items,
  isUrdu,
}: {
  items: FaqRow[];
  isUrdu: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full px-5 py-4 flex items-center justify-between gap-3 text-start"
            >
              <span
                className={`font-medium text-sm sm:text-base text-[var(--text-primary)] ${
                  isUrdu ? "font-urdu-nastaliq" : ""
                }`}
              >
                {item.question}
              </span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 text-[var(--accent-gold)] transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-4 pt-1 border-t border-[var(--border-subtle)]">
                <p
                  className={`text-sm text-[var(--text-secondary)] ${
                    isUrdu ? "font-urdu-nastaliq" : "leading-relaxed"
                  }`}
                >
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
