import { AnimatePresence, motion } from "framer-motion";

export interface GlassToastProps {
  open: boolean;
  message: string;
}

export function GlassToast({ open, message }: GlassToastProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-full glass-3 glass-lens-glints glass-border-mask px-5 py-2.5 text-xs font-medium text-[var(--text-primary)] whitespace-nowrap"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
