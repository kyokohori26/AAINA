import React from "react";
import { Link } from "react-router-dom";
import { Shield, MessageSquare, Mail, ExternalLink, X, HeartHandshake } from "lucide-react";

export default function ParentAlertModal({ payload, onClose }) {
  if (!payload || !payload.alert_triggered) return null;

  const encodedBody = encodeURIComponent(payload.message_text || "");
  const smsHref = `sms:${payload.parent_contact || ""}?&body=${encodedBody}`;
  const mailHref = `mailto:${payload.parent_contact || ""}?subject=Aaina Care Alert Check-in&body=${encodedBody}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-card shadow-mirror-lg max-w-lg w-full p-6 border border-cream-300 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-ink-muted hover:text-ink hover:bg-cream-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Shield */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-peach-light text-peach flex items-center justify-center flex-shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-peach uppercase tracking-wider">Family Care Link</span>
            <h3 className="text-lg font-bold text-ink leading-tight">Parent Alert Preview</h3>
          </div>
        </div>

        {/* Teen reassurance banner */}
        <div className="p-3.5 rounded-input bg-lavender-light/70 border border-lavender/40 mb-4">
          <p className="text-sm font-bold text-lavender-dark leading-snug">
            "{payload.teen_notification || "I let your parent know you might need some care. You're not in trouble."}"
          </p>
          <p className="text-xs text-ink-muted mt-1">
            Aaina never shares your diary words, thoughts, or secrets. Only a gentle nudge to check in.
          </p>
        </div>

        {/* Simulated Care Alert Card */}
        <div className="p-4 rounded-input bg-cream-50 border border-cream-300 mb-5">
          <div className="flex items-center justify-between text-xs font-bold text-ink-muted mb-2">
            <span>To: {payload.parent_name} ({payload.parent_contact || "Parent/Guardian"})</span>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-cream-300">Simulated Alert</span>
          </div>
          <p className="text-xs text-ink leading-relaxed font-medium bg-white p-3 rounded-lg border border-cream-200 shadow-soft">
            "{payload.message_text}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <a
            href={smsHref}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-button bg-mirror-blue text-white font-bold text-xs shadow-sm hover:bg-mirror-hover transition-colors tap-target"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send by SMS</span>
          </a>
          <a
            href={mailHref}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-button bg-cream-200 text-ink font-bold text-xs hover:bg-cream-300 transition-colors tap-target"
          >
            <Mail className="w-4 h-4" />
            <span>Send by Email</span>
          </a>
        </div>

        {/* View Parent Demo Page link */}
        <div className="flex items-center justify-between pt-3 border-t border-cream-200 text-xs">
          <Link
            to="/parent-demo"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-mirror-blue font-bold hover:underline"
          >
            <span>View Parent Demo Phone Screen</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink font-semibold"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}
