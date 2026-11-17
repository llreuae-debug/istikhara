export function AnswerSummary({
  text,
  isUrdu,
}: {
  text: string;
  isUrdu: boolean;
}) {
  return (
    <div className="answer-summary rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-elevated)] p-4 sm:p-5">
      <p
        className={`text-sm sm:text-base text-[var(--text-primary)] ${
          isUrdu ? "font-urdu-nastaliq" : "leading-relaxed font-medium"
        }`}
      >
        {text}
      </p>
    </div>
  );
}
