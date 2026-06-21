import { Image } from "lucide-react";
import { classNames } from "../../utils/classNames";
import { usePhotoBlobUrl } from "../../hooks/usePhotoBlobUrl";
import type { PhotoCategory } from "../../types/domain";

const categoryColors: Record<PhotoCategory, string> = {
  "Avant travaux": "from-slate-400 to-slate-600",
  "Pendant travaux": "from-orange-400 to-orange-600",
  "Après travaux": "from-emerald-400 to-emerald-600",
};

interface AuthenticatedPhotoProps {
  photoId: string;
  category: PhotoCategory;
  alt: string;
  className?: string;
  fit?: "cover" | "contain";
}

export function AuthenticatedPhoto({
  photoId,
  category,
  alt,
  className,
  fit = "cover",
}: AuthenticatedPhotoProps) {
  const { data: blobUrl, isError, isLoading } = usePhotoBlobUrl(photoId);

  if (blobUrl) {
    return (
      <img
        src={blobUrl}
        alt={alt}
        className={classNames(
          "h-full w-full",
          fit === "cover" ? "object-cover" : "object-contain",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={classNames(
        "flex h-full w-full items-center justify-center bg-gradient-to-br",
        categoryColors[category],
        className,
      )}
    >
      {isLoading ? (
        <span className="text-xs text-white/70">Chargement…</span>
      ) : (
        <Image size={32} className="text-white/60" aria-hidden={isError} />
      )}
    </div>
  );
}
