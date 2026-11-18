import { motion } from "framer-motion";
import { useReducedMotionPref } from "@/lib/glass/useLowPower";

export interface GlassToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  className?: string;
}

export function GlassToggle({
  checked,
  onChange,
  label,
  id,
  className = "",
}: GlassToggleProps) {
  const reduced = useReducedMotionPref();

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center w-14 h-8 rounded-full p-1 glass-track glass-border-mask transition-colors cursor-pointer ${
        checked ? "bg-[var(--gold)]/30" : ""
      } ${className}`}
    >
      <motion.span
        aria-hidden="true"
        layout
        transition={
          reduced
            ? { duration: 0.15 }
            : { type: "spring", stiffness: 460, damping: 28, mass: 0.85 }
        }
        className={`block w-6 h-6 rounded-full glass-3 glass-lens-glints ${
          checked ? "ms-auto bg-[#E6CF7A]/80" : "me-auto"
        }`}
      />
    </button>
  );
}
