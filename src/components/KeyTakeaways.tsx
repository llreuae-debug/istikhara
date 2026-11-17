export function KeyTakeaways({
  title,
  points,
  isUrdu,
}: {
  title: string;
  points: string[];
  isUrdu: boolean;
}) {
  return (
    <aside className="rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-5 space-y-3">
      <h2
        className={`text-lg font-semibold text-[var(--accent-gold)] ${
          isUrdu ? "font-urdu-nastaliq" : "font-display-serif text-xl"
        }`}
      >
        {title}
      </h2>
      <ul
        className={`space-y-2 text-sm text-[var(--text-secondary)] list-disc list-inside ${
          isUrdu ? "font-urdu-nastaliq" : "leading-relaxed"
        }`}
      >
        {points.map((pt) => (
          <li key={pt}>{pt}</li>
        ))}
      </ul>
    </aside>
  );
}
