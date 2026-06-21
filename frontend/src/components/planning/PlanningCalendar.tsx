import type { PlanningViewMode, ScheduleSlot, Worker } from "../../types/domain";
import {
  addDays,
  formatDayLabel,
  formatTime,
  sameDay,
  startOfWeek,
} from "../../utils/planningDates";

interface PlanningCalendarProps {
  viewMode: PlanningViewMode;
  anchorDate: Date;
  workers: Worker[];
  slots: ScheduleSlot[];
  onSlotClick?: (slot: ScheduleSlot) => void;
  onEmptyClick?: (workerId: string, day: Date) => void;
  readOnly?: boolean;
}

function slotsForWorkerDay(
  slots: ScheduleSlot[],
  workerId: string,
  day: Date,
): ScheduleSlot[] {
  return slots.filter(
    (slot) =>
      slot.workerId === workerId &&
      sameDay(new Date(slot.startAt), day),
  );
}

function slotButtonClass(slot: ScheduleSlot): string {
  if (slot.status === "Annulé") {
    return "rounded-lg border border-dashed border-muted bg-muted/20 px-2 py-1 text-left text-xs opacity-70 line-through";
  }
  return "rounded-lg border border-primary/20 bg-primary/5 px-2 py-1 text-left text-xs hover:bg-primary/10";
}

function monthSlotClass(slot: ScheduleSlot): string {
  if (slot.status === "Annulé") {
    return "block w-full truncate rounded border border-dashed border-muted bg-muted/20 px-1 py-0.5 text-left text-[10px] text-muted line-through";
  }
  return "block w-full truncate rounded bg-primary/10 px-1 py-0.5 text-left text-[10px] text-primary";
}

export function PlanningCalendar({
  viewMode,
  anchorDate,
  workers,
  slots,
  onSlotClick,
  onEmptyClick,
  readOnly = false,
}: PlanningCalendarProps) {
  if (viewMode === "month") {
    const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    const monthEnd = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
    const days: Date[] = [];
    for (let d = new Date(monthStart); d <= monthEnd; d = addDays(d, 1)) {
      days.push(new Date(d));
    }
    return (
      <div
        className="overflow-x-auto rounded-xl border border-border bg-white"
        data-testid="planning-calendar-month"
      >
        <div className="grid grid-cols-7 gap-px bg-border text-center text-xs font-medium">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((label) => (
            <div key={label} className="bg-muted/30 px-2 py-2">
              {label}
            </div>
          ))}
          {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[80px] bg-white" />
          ))}
          {days.map((day) => {
            const daySlots = slots.filter((s) => sameDay(new Date(s.startAt), day));
            return (
              <div key={day.toISOString()} className="min-h-[80px] bg-white p-1 text-left">
                <div className="text-xs font-semibold text-muted">
                  {day.getDate()}
                </div>
                <div className="mt-1 space-y-1">
                  {daySlots.slice(0, 3).map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => onSlotClick?.(slot)}
                      className={monthSlotClass(slot)}
                      data-testid={`planning-slot-${slot.id}`}
                    >
                      {slot.workerName.split(" ")[0]} · {slot.projectReference}
                    </button>
                  ))}
                  {daySlots.length > 3 && (
                    <span className="text-[10px] text-muted">+{daySlots.length - 3}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const weekStart = startOfWeek(anchorDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div
      className="overflow-x-auto rounded-xl border border-border bg-white"
      data-testid="planning-calendar-week"
    >
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/20">
            <th className="sticky left-0 bg-muted/20 px-3 py-2 text-left font-medium">
              Ouvrier
            </th>
            {days.map((day) => (
              <th key={day.toISOString()} className="px-2 py-2 text-center font-medium">
                {formatDayLabel(day)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {workers.map((worker) => (
            <tr key={worker.id} className="border-b border-border last:border-0">
              <td className="sticky left-0 bg-white px-3 py-2 font-medium">
                <div>{worker.fullName}</div>
                {worker.trade && (
                  <div className="text-xs text-muted">{worker.trade}</div>
                )}
              </td>
              {days.map((day) => {
                const daySlots = slotsForWorkerDay(slots, worker.id, day);
                return (
                  <td
                    key={day.toISOString()}
                    className="min-w-[120px] align-top px-1 py-1"
                  >
                    <div className="flex min-h-[72px] flex-col gap-1">
                      {daySlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => onSlotClick?.(slot)}
                          className={slotButtonClass(slot)}
                          data-testid={`planning-slot-${slot.id}`}
                        >
                          <div
                            className={
                              slot.status === "Annulé"
                                ? "font-medium text-muted"
                                : "font-medium text-primary"
                            }
                          >
                            {slot.projectReference}
                          </div>
                          <div className="text-muted">
                            {formatTime(slot.startAt)} – {formatTime(slot.endAt)}
                          </div>
                          <div className="text-[10px] uppercase tracking-wide text-muted">
                            {slot.status}
                          </div>
                        </button>
                      ))}
                      {!readOnly && daySlots.length === 0 && (
                        <button
                          type="button"
                          onClick={() => onEmptyClick?.(worker.id, day)}
                          className="flex-1 rounded-lg border border-dashed border-border text-xs text-muted hover:border-primary hover:text-primary"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
