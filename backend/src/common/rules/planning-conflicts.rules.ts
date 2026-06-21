import type { ScheduleStatus } from '@prisma/client';

export interface ScheduleInterval {
  id?: string;
  startAt: Date;
  endAt: Date;
  status: ScheduleStatus;
}

/** RG-PLA-02 — fin strictement après début */
export function validateScheduleInterval(startAt: Date, endAt: Date): string | null {
  if (!(startAt instanceof Date) || !(endAt instanceof Date)) {
    return 'Dates invalides.';
  }
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return 'Dates invalides.';
  }
  if (endAt <= startAt) {
    return 'La fin du créneau doit être postérieure au début.';
  }
  return null;
}

export function isActiveScheduleStatus(status: ScheduleStatus): boolean {
  return status !== 'CANCELLED';
}

/** RG-PLA-01 — chevauchement temporel (bornes exclusives à l'extrémité) */
export function schedulesOverlap(
  a: Pick<ScheduleInterval, 'startAt' | 'endAt'>,
  b: Pick<ScheduleInterval, 'startAt' | 'endAt'>,
): boolean {
  return a.startAt < b.endAt && a.endAt > b.startAt;
}

export function findScheduleConflict(
  candidate: ScheduleInterval,
  existing: ScheduleInterval[],
): ScheduleInterval | null {
  for (const slot of existing) {
    if (candidate.id && slot.id === candidate.id) continue;
    if (!isActiveScheduleStatus(slot.status)) continue;
    if (schedulesOverlap(candidate, slot)) {
      return slot;
    }
  }
  return null;
}

const REFERENCE_HOURS_PER_WEEK = 35;

export function computeOccupationPercent(
  plannedHours: number,
  weekCount: number,
): number {
  if (weekCount <= 0) return 0;
  const referenceHours = REFERENCE_HOURS_PER_WEEK * weekCount;
  if (referenceHours <= 0) return 0;
  return Math.round((plannedHours / referenceHours) * 1000) / 10;
}

export function hoursBetween(startAt: Date, endAt: Date): number {
  const ms = endAt.getTime() - startAt.getTime();
  return ms > 0 ? ms / (1000 * 60 * 60) : 0;
}

export function weekCountBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  if (ms <= 0) return 0;
  return ms / (1000 * 60 * 60 * 24 * 7);
}
