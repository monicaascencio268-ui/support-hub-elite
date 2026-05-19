import { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  required?: boolean;
  onCancel: () => void;
  onConfirm: (value: string) => void;
}

export function PromptModal({
  open, title, description, placeholder, confirmLabel = "Confirmar",
  cancelLabel = "Cancelar", variant = "primary", required = true,
  onCancel, onConfirm,
}: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setValue("");
      setTimeout(() => ref.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (required && !value.trim()) return;
    onConfirm(value.trim());
  };

  const confirmCls =
    variant === "danger"
      ? "bg-status-rejected text-white hover:brightness-110"
      : "bg-primary text-primary-foreground hover:brightness-110";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-4 rounded-xl border border-border bg-surface p-6 shadow-2xl"
      >
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          placeholder={placeholder}
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button" onClick={onCancel}
            className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {cancelLabel}
          </button>
          <button
            type="submit" disabled={required && !value.trim()}
            className={`rounded-md px-4 py-2 text-sm font-semibold shadow-lg disabled:opacity-50 ${confirmCls}`}
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
