import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export interface GlassSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function GlassSheet({ open, onClose, title, children }: GlassSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 260 }}
            dragElastic={{ top: 0.08, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 400) {
                onClose();
              }
            }}
            className="relative z-10 w-full max-w-xl rounded-t-[28px] glass-2 glass-border-mask glass-noise p-5 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] space-y-4"
          >
            <div className="w-12 h-1.5 rounded-full bg-white/30 mx-auto" />
            <div className="flex items-center justify-between gap-2">
              {title && (
                <h2 className="text-base font-semibold text-[var(--accent-gold)]">
                  {title}
                </h2>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-full glass-1 inline-flex items-center justify-center text-[var(--text-secondary)]"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
