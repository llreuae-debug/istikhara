import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumbs({
  items,
  isRtl,
}: {
  items: BreadcrumbItem[];
  isRtl: boolean;
}) {
  const Sep = isRtl ? ChevronLeft : ChevronRight;

  return (
    <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)]">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, idx) => (
          <li key={item.label} className="inline-flex items-center gap-1.5">
            {idx > 0 && <Sep className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />}
            {item.to ? (
              <Link
                to={item.to}
                className="hover:text-[var(--accent-gold)] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[var(--text-secondary)]" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
