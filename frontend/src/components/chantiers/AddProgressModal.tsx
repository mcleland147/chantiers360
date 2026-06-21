import { useEffect, useState } from "react";

interface AddProgressModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: { comment: string; percent?: number }) => void;
}

export function AddProgressModal({
  isOpen,
  isSubmitting = false,
  error,
  onClose,
  onSubmit,
}: AddProgressModalProps) {
  const [comment, setComment] = useState("");
  const [percent, setPercent] = useState("");

  useEffect(() => {
    if (isOpen) {
      setComment("");
      setPercent("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed =
      percent.trim() === "" ? undefined : Number.parseInt(percent, 10);
    onSubmit({
      comment: comment.trim(),
      percent: Number.isNaN(parsed) ? undefined : parsed,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      data-testid="add-progress-modal"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-900">
          Ajouter une mise à jour
        </h3>
        <p className="mt-1 text-xs text-muted">
          Commentaire obligatoire (RG-TABS-001).
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Commentaire</span>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="Décrivez l'avancement terrain…"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">
              Pourcentage d&apos;avancement (optionnel)
            </span>
            <input
              type="number"
              min={0}
              max={100}
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="0 – 100"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
            >
              {isSubmitting ? "Enregistrement…" : "Enregistrer"}
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
