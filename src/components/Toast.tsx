import { useEffect } from "react";

export function Toast({
  message,
  variant = "info",
  onClose,
  duration = 4000,
}: {
  message: string | null;
  variant?: "info" | "success" | "error";
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  const cls =
    variant === "success"
      ? "border-status-finished/40 bg-status-finished/15 text-status-finished"
      : variant === "error"
      ? "border-status-rejected/40 bg-status-rejected/15 text-status-rejected"
      : "border-border bg-surface text-foreground";

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-2">
      <div className={`rounded-lg border px-4 py-3 text-sm shadow-2xl ${cls}`}>
        <div className="flex items-start gap-3">
          <span className="flex-1">{message}</span>
          <button
            onClick={onClose}
            className="text-xs opacity-70 hover:opacity-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
