import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isDanger = true,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-card shadow-mirror-lg max-w-md w-full p-6 border border-cream-300"
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full flex-shrink-0 ${isDanger ? "bg-rose-100 text-rose-600" : "bg-mirror-light text-mirror-blue"}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-ink mb-1.5">{title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-button text-sm font-semibold text-ink-muted hover:text-ink hover:bg-cream-100 transition-colors tap-target"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`px-5 py-2.5 rounded-button text-sm font-semibold text-white shadow-sm transition-all tap-target ${
                isDanger
                  ? "bg-rose-500 hover:bg-rose-600 active:scale-95"
                  : "bg-mirror-blue hover:bg-mirror-hover active:scale-95"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
