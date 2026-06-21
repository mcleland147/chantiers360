import { useEffect, useRef, useState } from "react";
import type { PhotoCategory } from "../../types/domain";

const CATEGORIES: PhotoCategory[] = [
  "Avant travaux",
  "Pendant travaux",
  "Après travaux",
];

const MAX_FILES = 10;
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,.jpg,.jpeg,.png";

interface AddPhotoModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: {
    files: File[];
    category: PhotoCategory;
    comment?: string;
  }) => void;
}

function validateFiles(files: File[]): string | null {
  if (files.length === 0) {
    return "Sélectionnez au moins une photo.";
  }
  if (files.length > MAX_FILES) {
    return `Maximum ${MAX_FILES} fichiers par envoi.`;
  }
  for (const file of files) {
    const lower = file.name.toLowerCase();
    const okExt =
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png");
    const okMime = file.type === "image/jpeg" || file.type === "image/png";
    if (!okExt || !okMime) {
      return `Format non autorisé : ${file.name} (JPG ou PNG uniquement).`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `${file.name} dépasse 10 Mo.`;
    }
  }
  return null;
}

export function AddPhotoModal({
  isOpen,
  isSubmitting = false,
  error,
  onClose,
  onSubmit,
}: AddPhotoModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<PhotoCategory>("Pendant travaux");
  const [comment, setComment] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFiles([]);
      setCategory("Pendant travaux");
      setComment("");
      setLocalError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    setLocalError(validateFiles(selected));
    setFiles(selected);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validateFiles(files);
    if (validation) {
      setLocalError(validation);
      return;
    }
    setLocalError(null);
    onSubmit({
      files,
      category,
      comment: comment.trim() || undefined,
    });
  };

  const displayError = localError ?? error;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      data-testid="add-photo-modal"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-900">Ajouter des photos</h3>
        <p className="mt-1 text-xs text-muted">
          JPG ou PNG — max 10 Mo par fichier — jusqu&apos;à {MAX_FILES} fichiers.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {displayError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {displayError}
            </p>
          )}

          <div className="block text-sm">
            <span className="mb-1 block font-medium">Fichiers</span>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              multiple
              data-testid="photo-file-input"
              onChange={handleFileChange}
              className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            />
            {files.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-muted">
                {files.map((f) => (
                  <li key={`${f.name}-${f.size}`}>{f.name}</li>
                ))}
              </ul>
            )}
          </div>

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
              disabled={isSubmitting || files.length === 0}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
            >
              {isSubmitting ? "Envoi…" : "Envoyer"}
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
