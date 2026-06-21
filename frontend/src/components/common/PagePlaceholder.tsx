interface PagePlaceholderProps {
  title: string;
  description: string;
  /** Bandeau gris MVP — masquer pour les messages métier (ex. accès refusé). */
  showDevHint?: boolean;
}

/** Carte placeholder — style cartes Figma (fond blanc, bordure légère) */
export function PagePlaceholder({
  title,
  description,
  showDevHint = true,
}: PagePlaceholderProps) {
  return (
    <section className="p-5">
      <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-muted">{description}</p>
        {showDevHint && (
          <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-xs text-muted">
            Écran placeholder — implémentation visuelle à venir.
          </p>
        )}
      </div>
    </section>
  );
}
