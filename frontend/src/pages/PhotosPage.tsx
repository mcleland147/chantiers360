import { useMemo, useState } from "react";
import { GlobalPhotoGrid } from "../components/photos/GlobalPhotoGrid";
import { LoadingState } from "../components/common/LoadingState";
import { useChantiersQuery } from "../hooks/useChantiers";
import { useGlobalPhotosQuery } from "../hooks/useGlobalTabs";
import type { PhotoCategory } from "../types/domain";

const CATEGORIES: PhotoCategory[] = [
  "Avant travaux",
  "Pendant travaux",
  "Après travaux",
];

export function PhotosPage() {
  const [chantierId, setChantierId] = useState("");
  const [category, setCategory] = useState<PhotoCategory | "">("");

  const filters = useMemo(
    () => ({
      chantierId: chantierId || undefined,
      category: category || undefined,
    }),
    [chantierId, category],
  );

  const { data: photos = [], isLoading } = useGlobalPhotosQuery(filters);
  const { data: chantiers = [] } = useChantiersQuery();

  const authors = useMemo(() => {
    const names = new Set(photos.map((p) => p.authorName));
    return [...names].sort();
  }, [photos]);

  const [authorFilter, setAuthorFilter] = useState("");
  const filteredPhotos = useMemo(() => {
    if (!authorFilter) return photos;
    return photos.filter((p) => p.authorName === authorFilter);
  }, [photos, authorFilter]);

  return (
    <div className="space-y-5 p-5">
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-muted">
              Chantier
            </span>
            <select
              value={chantierId}
              onChange={(e) => setChantierId(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              {chantiers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.reference} — {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-muted">
              Catégorie
            </span>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as PhotoCategory | "")
              }
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              <option value="">Toutes</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-muted">
              Auteur
            </span>
            <select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              {authors.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {isLoading ? (
        <LoadingState label="Chargement de la photothèque…" />
      ) : (
        <GlobalPhotoGrid photos={filteredPhotos} />
      )}
    </div>
  );
}

export const photosHandle = {
  title: "Photos",
  subtitle: "Photothèque des chantiers",
};
