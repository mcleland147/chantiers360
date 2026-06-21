import { HardHat } from "lucide-react";
import { classNames } from "../../utils/classNames";

interface BrandHeaderProps {
  compact?: boolean;
  onDark?: boolean;
}

/** En-tête logo Chantiers360 — aligné prototype Figma */
export function BrandHeader({ compact = false, onDark = true }: BrandHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={classNames(
          "flex shrink-0 items-center justify-center rounded-xl bg-accent",
          compact ? "h-8 w-8" : "h-10 w-10",
        )}
      >
        <HardHat size={compact ? 15 : 20} className="text-white" />
      </div>
      <div className="min-w-0">
        <div
          className={classNames(
            "font-semibold leading-tight",
            compact ? "text-sm" : "text-lg",
            onDark ? "text-white" : "text-slate-900",
          )}
        >
          Chantiers360
        </div>
        <div
          className={classNames(
            "uppercase tracking-widest",
            compact ? "text-[9px]" : "text-[10px]",
            onDark ? "text-white/40" : "text-muted",
          )}
        >
          {compact ? "BatiNova Travaux" : "by BatiNova Travaux"}
        </div>
      </div>
    </div>
  );
}
