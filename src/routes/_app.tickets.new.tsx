import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useApp } from "@/lib/app-store";

export const Route = createFileRoute("/_app/tickets/new")({
  head: () => ({ meta: [{ title: "Nuevo ticket — Helpdesk IT" }] }),
  component: NewTicket,
});

function NewTicket() {
  const { createTicket } = useApp();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Software");
  const [priority, setPriority] = useState<"Baja" | "Media" | "Alta" | "Crítica">("Media");
  const [files, setFiles] = useState<File[]>([]);
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 5) return setErr("El título debe tener al menos 5 caracteres.");
    if (description.trim().length < 10) return setErr("Describe el problema con más detalle.");
    const id = createTicket({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      attachments: files.map((f) => ({ name: f.name, size: f.size })),
    });
    navigate({ to: "/tickets/$id", params: { id } });
  };

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 5));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Crear ticket</h1>
        <p className="text-sm text-muted-foreground">
          Cuéntanos qué pasa. El equipo de soporte lo revisará y asignará pronto.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5 rounded-xl border border-border bg-surface/60 p-6">
        <Field label="Título">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="Resumen breve del problema"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoría">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
            >
              {["Software", "Hardware", "Redes", "Cuentas", "Seguridad", "Otro"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Prioridad">
            <div className="grid grid-cols-4 gap-1.5">
              {(["Baja", "Media", "Alta", "Crítica"] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`rounded-md border px-2 py-2 text-xs font-medium transition ${
                    priority === p
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Descripción">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            maxLength={2000}
            placeholder="Pasos, mensajes de error, qué intentaste…"
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
          />
        </Field>

        <Field label="Archivos adjuntos">
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFiles(e.dataTransfer.files);
            }}
            className="cursor-pointer rounded-md border border-dashed border-border bg-background/60 px-4 py-8 text-center text-sm text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
          >
            <div className="font-medium">Arrastra archivos o haz click</div>
            <div className="text-xs">PNG, PDF, LOG · máx 5 archivos</div>
            <input
              ref={fileRef}
              type="file"
              multiple
              hidden
              onChange={(e) => onFiles(e.target.files)}
            />
          </div>
          {files.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {files.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-xs"
                >
                  <span className="truncate">{f.name}</span>
                  <span className="flex items-center gap-3">
                    <span className="text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</span>
                    <button
                      type="button"
                      onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      ✕
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Field>

        {err && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {err}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard" })}
            className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110"
          >
            Crear ticket
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
