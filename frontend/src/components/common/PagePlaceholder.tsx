interface PagePlaceholderProps {
  title: string;
  description: string;
}

/** Carte placeholder — style cartes Figma (fond blanc, bordure légère) */
export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="p-5">
      <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-xs text-muted">
          Écran placeholder — implémentation visuelle à venir.
        </p>
      </div>
    </section>
  );
}
