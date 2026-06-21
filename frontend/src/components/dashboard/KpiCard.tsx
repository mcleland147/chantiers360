import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { classNames } from "../../utils/classNames";

interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  iconBgClass: string;
  iconColorClass: string;
  delta?: string;
  deltaUp?: boolean;
}

export function KpiCard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconBgClass,
  iconColorClass,
  delta,
  deltaUp = true,
}: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
          <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
          {delta && (
            <div
              className={classNames(
                "mt-1.5 flex items-center gap-1 text-xs font-medium",
                deltaUp ? "text-emerald-600" : "text-red-500",
              )}
            >
              {deltaUp ? (
                <TrendingUp size={11} aria-hidden />
              ) : (
                <TrendingDown size={11} aria-hidden />
              )}
              {delta} vs mois préc.
            </div>
          )}
        </div>
        <div className={classNames("rounded-lg p-2", iconBgClass)}>
          <Icon size={17} className={iconColorClass} aria-hidden />
        </div>
      </div>
    </div>
  );
}
