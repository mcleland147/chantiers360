import { useEffect, useState } from "react";
import type { ReservePriority } from "../../types/domain";

const PRIORITIES: ReservePriority[] = [
  "Faible",
  "Moyenne",
  "Haute",
  "Critique",
];

interface CreateReserveModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    description?: string;
    priority: ReservePriority;
  }) => void;
}

export function CreateReserveModal({
  isOpen,
  isSubmitting = false,
  error,
  onClose,
  onSubmit,
}: CreateReserveModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<ReservePriority>("Moyenne");

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setPriority("Moyenne");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      data-testid="create-reserve-modal"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-900">Nouvelle réserve</h3>
        <p className="mt-1 text-xs text-muted">
          Statut initial : Ouverte (RG-TABS-003).
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Titre</span>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="Description courte du problème"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Description (optionnelle)</span>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Priorité</span>
            <select
              required
              value={priority}
              onChange={(e) => setPriority(e.target.value as ReservePriority)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
            >
              {isSubmitting ? "Création…" : "Créer la réserve"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
