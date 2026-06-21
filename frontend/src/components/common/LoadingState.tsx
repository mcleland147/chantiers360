interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Chargement…" }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center p-10 text-sm text-muted">
      {label}
    </div>
  );
}
