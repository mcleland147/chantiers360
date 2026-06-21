import { Camera, Image, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { ChantierPhoto, PhotoCategory } from "../../types/domain";
import { classNames } from "../../utils/classNames";
import { EmptyState } from "../common/EmptyState";

const categoryColors: Record<PhotoCategory, string> = {
  "Avant travaux": "from-slate-400 to-slate-600",
  "Pendant travaux": "from-orange-400 to-orange-600",
  "Après travaux": "from-emerald-400 to-emerald-600",
};

interface GlobalPhotoGridProps {
  photos: ChantierPhoto[];
  showChantier?: boolean;
}

export function GlobalPhotoGrid({
  photos,
  showChantier = true,
}: GlobalPhotoGridProps) {
  const [preview, setPreview] = useState<ChantierPhoto | null>(null);

  if (photos.length === 0) {
    return (
      <EmptyState
        icon={Camera}
        title="Aucune photo"
        description="Aucune photo ne correspond aux filtres sélectionnés."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setPreview(photo)}
            className="overflow-hidden rounded-xl border border-border bg-white text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className={classNames(
                "flex aspect-video items-center justify-center bg-gradient-to-br",
                categoryColors[photo.category],
              )}
            >
              <Image size={32} className="text-white/60" />
            </div>
            <div className="p-3">
              <p className="truncate text-xs font-medium text-slate-900">
                {photo.fileName}
              </p>
              {showChantier && photo.chantierName && (
                <p className="mt-1 truncate text-[11px] text-accent">
                  {photo.chantierReference} — {photo.chantierName}
                </p>
              )}
              <p className="mt-1 text-[11px] text-muted">
                {photo.category} · {photo.authorName} · {photo.date}
              </p>
            </div>
          </button>
        ))}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          data-testid="photo-preview-modal"
        >
          <div className="relative w-full max-w-2xl rounded-xl bg-white p-4 shadow-xl">
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute right-3 top-3 rounded-lg p-1 text-muted hover:bg-slate-100"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
            <div
              className={classNames(
                "flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br",
                categoryColors[preview.category],
              )}
            >
              <Image size={48} className="text-white/70" />
            </div>
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold text-slate-900">
                {preview.fileName}
              </h3>
              <p className="text-xs text-muted">
                {preview.category} · {preview.authorName} · {preview.date}
              </p>
              {preview.comment && (
                <p className="text-sm text-slate-600">{preview.comment}</p>
              )}
              {showChantier && preview.chantierId && (
                <Link
                  to={`/chantiers/${preview.chantierId}?tab=photos`}
                  className="inline-block text-xs font-medium text-accent hover:underline"
                >
                  Voir la fiche chantier
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
