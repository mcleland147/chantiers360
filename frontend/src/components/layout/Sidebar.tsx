import { HardHat, Menu, User } from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { getNavItemsForRole } from "../../config/navigation";
import { getRoleLabel, useAuth } from "../../contexts/AuthContext";
import { useGlobalOpenReservesCountQuery } from "../../hooks/useGlobalTabs";
import { classNames } from "../../utils/classNames";
import { BrandHeader } from "../brand/BrandHeader";

function isNavItemActive(pathname: string, path: string): boolean {
  if (path === "/dashboard" || path === "/dashboard/direction") {
    return pathname === path;
  }
  if (path === "/chantiers") {
    return pathname === "/chantiers" || pathname.startsWith("/chantiers/");
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function Sidebar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const navItems = getNavItemsForRole(user.role);
  const hasReservesNav = navItems.some((item) => item.path === "/reserves");
  const { data: openReservesCount } =
    useGlobalOpenReservesCountQuery(hasReservesNav);

  return (
    <aside
      className={classNames(
        "flex h-full shrink-0 flex-col bg-brand transition-all duration-200",
        collapsed ? "w-[60px]" : "w-[232px]",
      )}
    >
      <div
        className="flex items-center gap-2.5 border-b px-3.5 py-4"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        {collapsed ? (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <HardHat size={15} className="text-white" />
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <BrandHeader compact />
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="rounded p-1 text-white/35 transition-colors hover:text-white/70"
          aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
        >
          <Menu size={15} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {!collapsed && (
          <div className="mb-2 px-4">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-white/25">
              Navigation
            </span>
          </div>
        )}
        <div className="space-y-0.5 px-2">
          {navItems.map(({ label, path, icon: Icon, badge: staticBadge }) => {
            const badge =
              path === "/reserves" && openReservesCount !== undefined
                ? openReservesCount
                : staticBadge;
            const active = isNavItemActive(pathname, path);
            return (
              <NavLink
                key={path}
                to={path}
                title={collapsed ? label : undefined}
                className={classNames(
                  "flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-all",
                  collapsed && "justify-center",
                  active
                    ? "bg-accent text-white shadow-sm"
                    : "text-white/55 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon size={16} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{label}</span>
                    {badge !== undefined && badge > 0 && (
                      <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div
        className={classNames(
          "flex items-center gap-2.5 border-t p-3",
          collapsed && "justify-center",
        )}
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/20">
          <User size={13} className="text-accent" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-white">
              {user.firstName} {user.lastName}
            </div>
            <div className="truncate text-[11px] text-white/35">
              {getRoleLabel(user.role)}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
