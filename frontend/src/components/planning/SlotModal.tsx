import { useEffect, useState } from "react";
import type { Chantier, ScheduleSlot, Worker } from "../../types/domain";
import type { CreateSlotPayload } from "../../services/planningService";

interface SlotModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSlotPayload) => Promise<void>;
  onUpdate?: (id: string, payload: Partial<CreateSlotPayload>) => Promise<void>;
  onCancelSlot?: (id: string) => Promise<void>;
  workers: Worker[];
  chantiers: Chantier[];
  slot?: ScheduleSlot | null;
  error?: string;
  readOnly?: boolean;
  initial?: Partial<CreateSlotPayload>;
}

export function SlotModal({
  open,
  onClose,
  onSubmit,
  onUpdate,
  onCancelSlot,
  workers,
  chantiers,
  slot,
  error,
  readOnly = false,
  initial,
}: SlotModalProps) {
  const [workerId, setWorkerId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEdit = Boolean(slot?.id);
  const isCancelled = slot?.status === "Annulé";
  const formReadOnly = readOnly || isCancelled;

  useEffect(() => {
    if (!open) return;
    const source = slot
      ? {
          workerId: slot.workerId,
          projectId: slot.projectId,
          startAt: slot.startAt,
          endAt: slot.endAt,
          notes: slot.notes,
        }
      : initial;

    setWorkerId(source?.workerId ?? workers[0]?.id ?? "");
    setProjectId(source?.projectId ?? chantiers[0]?.id ?? "");
    if (source?.startAt) {
      const start = new Date(source.startAt);
      setDate(start.toISOString().slice(0, 10));
      setStartTime(start.toTimeString().slice(0, 5));
    } else {
      setDate(new Date().toISOString().slice(0, 10));
    }
    if (source?.endAt) {
      setEndTime(new Date(source.endAt).toTimeString().slice(0, 5));
    }
    setNotes(source?.notes ?? "");
  }, [open, slot, initial, workers, chantiers]);

  if (!open) return null;

  const buildPayload = (): CreateSlotPayload => {
    const startAt = new Date(`${date}T${startTime}:00`);
    const endAt = new Date(`${date}T${endTime}:00`);
    return {
      workerId,
      projectId,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      notes: notes.trim() || undefined,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formReadOnly) return;
    setSubmitting(true);
    try {
      const payload = buildPayload();
      if (isEdit && slot && onUpdate) {
        await onUpdate(slot.id, payload);
      } else {
        await onSubmit(payload);
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSlot = async () => {
    if (!slot || !onCancelSlot) return;
    setSubmitting(true);
    try {
      await onCancelSlot(slot.id);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg" data-testid="slot-modal">
        <h2 className="text-lg font-semibold">
          {formReadOnly
            ? "Détail créneau"
            : isEdit
              ? "Modifier le créneau"
              : "Affecter un ouvrier"}
        </h2>
        {error && (
          <p
            className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            data-testid="slot-modal-error"
          >
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-muted">Ouvrier</span>
            <select
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              disabled={formReadOnly}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              required
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.fullName}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-muted">Chantier</span>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={formReadOnly}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              required
            >
              {chantiers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.reference} — {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-muted">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={formReadOnly}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              required
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-muted">Début</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={formReadOnly}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-muted">Fin</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={formReadOnly}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                required
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-muted">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={formReadOnly}
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            {isEdit && !readOnly && !isCancelled && onCancelSlot && (
              <button
                type="button"
                onClick={handleCancelSlot}
                disabled={submitting}
                className="mr-auto rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700"
              >
                Annuler le créneau
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm"
            >
              Fermer
            </button>
            {!formReadOnly && (
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
              >
                {submitting ? "Enregistrement…" : "Enregistrer"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
