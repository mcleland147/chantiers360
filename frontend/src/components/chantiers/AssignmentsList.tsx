import { UserPlus, Users } from "lucide-react";
import type { Assignment } from "../../types/domain";
import { classNames } from "../../utils/classNames";
import { EmptyState } from "../common/EmptyState";

interface AssignmentsListProps {
  assignments: Assignment[];
  canAssign?: boolean;
  onAssign?: () => void;
}

export function AssignmentsList({
  assignments,
  canAssign = false,
  onAssign,
}: AssignmentsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Affectations équipe
          </h3>
          <p className="text-xs text-muted">
            {assignments.filter((a) => a.isActive).length} membre
            {assignments.filter((a) => a.isActive).length > 1 ? "s" : ""} actif
            {assignments.filter((a) => a.isActive).length > 1 ? "s" : ""} sur{" "}
            {assignments.length}
          </p>
        </div>
        {canAssign && (
          <button
            type="button"
            onClick={onAssign}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            <UserPlus size={15} />
            Affecter un membre
          </button>
        )}
      </div>

      {assignments.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucune affectation"
          description="Aucun collaborateur n'est affecté à ce chantier pour le moment."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/80">
                  <th className="px-4 py-3 text-xs font-semibold text-muted">
                    Collaborateur
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted">
                    Fonction
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted">
                    Date d&apos;affectation
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {assignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {assignment.collaboratorName}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {assignment.jobTitle}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">
                      {assignment.assignedAt}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={classNames(
                          "inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium",
                          assignment.isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-100 text-slate-500",
                        )}
                      >
                        {assignment.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
