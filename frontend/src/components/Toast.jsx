import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useUserStore } from "../store/userStore";

export default function Toast() {
  const { toast, hideToast } = useUserStore();

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-mirror-blue flex-shrink-0" />
  };

  const borders = {
    success: "border-emerald-200 bg-emerald-50/95 text-emerald-900",
    error: "border-rose-200 bg-rose-50/95 text-rose-900",
    info: "border-blue-200 bg-blue-50/95 text-blue-900"
  };

  return (
    <AnimatePresence>
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed top-6 right-6 z-50 max-w-sm w-full"
        >
          <div className={`flex items-center gap-3 px-4 py-3 rounded-card shadow-mirror border backdrop-blur-sm ${borders[toast.type] || borders.info}`}>
            {icons[toast.type] || icons.info}
            <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
            <button
              onClick={hideToast}
              aria-label="Close notification"
              className="text-ink-muted hover:text-ink transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
