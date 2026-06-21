import { Camera, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ChantierPhoto, PhotoCategory } from "../../types/domain";
import { classNames } from "../../utils/classNames";
import { EmptyState } from "../common/EmptyState";
import { AuthenticatedPhoto } from "../photos/AuthenticatedPhoto";

const CATEGORIES: PhotoCategory[] = [
  "Avant travaux",
  "Pendant travaux",
  "Après travaux",
];

interface PhotoGalleryProps {
  photos: ChantierPhoto[];
  canAdd?: boolean;
  canDelete?: boolean;
  onAdd?: () => void;
  onDelete?: (photo: ChantierPhoto) => void;
}

export function PhotoGallery({
  photos,
  canAdd = false,
  canDelete = false,
  onAdd,
  onDelete,
}: PhotoGalleryProps) {
  const [activeCategory, setActiveCategory] =
    useState<PhotoCategory>("Pendant travaux");
  const [preview, setPreview] = useState<ChantierPhoto | null>(null);

  const filtered = photos.filter((p) => p.category === activeCategory);
  const counts = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = photos.filter((p) => p.category === cat).length;
      return acc;
    },
    {} as Record<PhotoCategory, number>,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Photothèque du chantier
          </h3>
          <p className="text-xs text-muted">
            {photos.length} photo{photos.length > 1 ? "s" : ""} au total
          </p>
        </div>
        {canAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            <Plus size={15} />
            Ajouter une photo
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={classNames(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              activeCategory === category
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-white text-muted hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            {category}
            <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
              {counts[category]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Camera}
          title={`Aucune photo — ${activeCategory}`}
          description="Aucune photo dans cette catégorie pour le moment."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              className="overflow-hidden rounded-xl border border-border bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => setPreview(photo)}
                className="block aspect-video w-full overflow-hidden"
              >
                <AuthenticatedPhoto
                  photoId={photo.id}
                  category={photo.category}
                  alt={photo.fileName}
                />
              </button>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-xs font-medium text-slate-900">
                    {photo.fileName}
                  </p>
                  {canDelete && onDelete && (
                    <button
                      type="button"
                      aria-label="Supprimer la photo"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Supprimer la photo « ${photo.fileName} » ?`,
                          )
                        ) {
                          onDelete(photo);
                        }
                      }}
                      className="shrink-0 rounded p-1 text-muted hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-muted">
                  {photo.authorName} · {photo.date}
                </p>
                {photo.comment && (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
                    {photo.comment}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          data-testid="photo-preview-modal"
        >
          <div className="relative w-full max-w-3xl rounded-xl bg-white p-4 shadow-xl">
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute right-3 top-3 z-10 rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-muted hover:bg-white"
            >
              Fermer
            </button>
            <div className="aspect-video overflow-hidden rounded-lg">
              <AuthenticatedPhoto
                photoId={preview.id}
                category={preview.category}
                alt={preview.fileName}
                fit="contain"
              />
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">
                {preview.fileName}
              </h3>
              <p className="text-xs text-muted">
                {preview.category} · {preview.authorName} · {preview.date}
              </p>
              {preview.comment && (
                <p className="text-sm text-slate-600">{preview.comment}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
