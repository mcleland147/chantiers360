import { Bell, LogOut, Search } from "lucide-react";
import { getRoleLabel } from "../../contexts/AuthContext";
import type { User } from "../../types/domain";

interface TopBarProps {
  title: string;
  subtitle?: string;
  user: User;
  onLogout: () => void;
}

export function TopBar({ title, subtitle, user, onLogout }: TopBarProps) {
  return (
    <header className="flex h-[52px] shrink-0 items-center gap-4 border-b border-border bg-white px-5">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-xs text-muted">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search
            size={14}
            className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            placeholder="Rechercher..."
            className="w-44 rounded-lg border border-border bg-surface py-1.5 pr-3 pl-8 text-sm focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none"
          />
        </div>
        <button
          type="button"
          className="relative rounded-lg p-2 transition-colors hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={16} className="text-muted" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>
        <div className="hidden h-6 w-px bg-border md:block" />
        <div className="hidden text-right md:block">
          <p className="text-xs font-medium text-slate-900">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-[10px] text-muted">{getRoleLabel(user.role)}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          aria-label="Déconnexion"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
