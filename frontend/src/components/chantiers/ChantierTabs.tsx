import {
  Camera,
  ClipboardList,
  History,
  Info,
  TrendingUp,
  Users,
} from "lucide-react";
import { classNames } from "../../utils/classNames";

export type ChantierTabId =
  | "informations"
  | "equipes"
  | "avancement"
  | "reserves"
  | "photos"
  | "historique";

interface TabDef {
  id: ChantierTabId;
  label: string;
  icon: typeof Info;
}

const TABS: TabDef[] = [
  { id: "informations", label: "Informations", icon: Info },
  { id: "equipes", label: "Équipes", icon: Users },
  { id: "avancement", label: "Avancement", icon: TrendingUp },
  { id: "reserves", label: "Réserves", icon: ClipboardList },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "historique", label: "Historique", icon: History },
];

interface ChantierTabsProps {
  activeTab: ChantierTabId;
  onTabChange: (tab: ChantierTabId) => void;
  reserveCount?: number;
}

export function ChantierTabs({
  activeTab,
  onTabChange,
  reserveCount,
}: ChantierTabsProps) {
  return (
    <div className="border-b border-border bg-white px-5">
      <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Onglets chantier">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={classNames(
                "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:border-slate-200 hover:text-slate-900",
              )}
            >
              <Icon size={15} />
              {label}
              {id === "reserves" && reserveCount !== undefined && reserveCount > 0 && (
                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                  {reserveCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
