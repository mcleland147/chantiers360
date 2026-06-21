import { useEffect, useState } from "react";
import type { PhotoCategory } from "../../types/domain";

const CATEGORIES: PhotoCategory[] = [
  "Avant travaux",
  "Pendant travaux",
  "Après travaux",
];

interface AddPhotoModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: {
    fileName: string;
    fileUrl?: string;
    category: PhotoCategory;
    comment?: string;
  }) => void;
}

function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const name = path.split("/").pop();
    return name && name.length > 0 ? name : "photo.jpg";
  } catch {
    const parts = url.split("/");
    return parts[parts.length - 1] || "photo.jpg";
  }
}

export function AddPhotoModal({
  isOpen,
  isSubmitting = false,
  error,
  onClose,
  onSubmit,
}: AddPhotoModalProps) {
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [category, setCategory] = useState<PhotoCategory>("Pendant travaux");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFileName("");
      setFileUrl("");
      setCategory("Pendant travaux");
      setComment("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedUrl = fileUrl.trim();
    const trimmedName = fileName.trim() || (trimmedUrl ? fileNameFromUrl(trimmedUrl) : "");
    onSubmit({
      fileName: trimmedName,
      fileUrl: trimmedUrl || undefined,
      category,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      data-testid="add-photo-modal"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-900">Ajouter une photo</h3>
        <p className="mt-1 text-xs text-muted">
          MVP : saisie URL ou nom de fichier (pas d&apos;upload binaire).
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Nom du fichier</span>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="facade-sud.jpg"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">URL de la photo (optionnelle)</span>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="https://… ou /uploads/photo.jpg"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Catégorie</span>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value as PhotoCategory)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Commentaire (optionnel)</span>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={
                isSubmitting || (!fileName.trim() && !fileUrl.trim())
              }
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
            >
              {isSubmitting ? "Ajout…" : "Ajouter"}
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
