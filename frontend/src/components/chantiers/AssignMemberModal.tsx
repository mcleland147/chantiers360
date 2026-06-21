import { useEffect, useState } from "react";
import type { AssignableUser } from "../../services/chantierTabsService";

interface AssignMemberModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  users: AssignableUser[];
  usersLoading?: boolean;
  onClose: () => void;
  onSubmit: (payload: { userId: string; functionLabel: string }) => void;
}

export function AssignMemberModal({
  isOpen,
  isSubmitting = false,
  error,
  users,
  usersLoading = false,
  onClose,
  onSubmit,
}: AssignMemberModalProps) {
  const [userId, setUserId] = useState("");
  const [functionLabel, setFunctionLabel] = useState("");

  useEffect(() => {
    if (isOpen) {
      setUserId("");
      setFunctionLabel("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ userId, functionLabel: functionLabel.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      data-testid="assign-member-modal"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-900">
          Affecter un membre
        </h3>
        <p className="mt-1 text-xs text-muted">
          Réservé au conducteur de travaux (RG-TABS-006).
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Collaborateur</span>
            <select
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={usersLoading}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              <option value="">
                {usersLoading ? "Chargement…" : "Sélectionner…"}
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Fonction sur le chantier</span>
            <input
              required
              type="text"
              value={functionLabel}
              onChange={(e) => setFunctionLabel(e.target.value)}
              placeholder="Chef de chantier, Électricien…"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !userId || !functionLabel.trim()}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
            >
              {isSubmitting ? "Affectation…" : "Affecter"}
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
