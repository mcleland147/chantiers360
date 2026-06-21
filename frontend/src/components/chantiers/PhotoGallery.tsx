import { Camera, Image, Plus } from "lucide-react";
import { useState } from "react";
import type { ChantierPhoto, PhotoCategory } from "../../types/domain";
import { classNames } from "../../utils/classNames";
import { EmptyState } from "../common/EmptyState";

const CATEGORIES: PhotoCategory[] = [
  "Avant travaux",
  "Pendant travaux",
  "Après travaux",
];

const categoryColors: Record<PhotoCategory, string> = {
  "Avant travaux": "from-slate-400 to-slate-600",
  "Pendant travaux": "from-orange-400 to-orange-600",
  "Après travaux": "from-emerald-400 to-emerald-600",
};

interface PhotoGalleryProps {
  photos: ChantierPhoto[];
  canAdd?: boolean;
  onAdd?: () => void;
}

export function PhotoGallery({
  photos,
  canAdd = false,
  onAdd,
}: PhotoGalleryProps) {
  const [activeCategory, setActiveCategory] =
    useState<PhotoCategory>("Pendant travaux");

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
    </div>
  );
}
