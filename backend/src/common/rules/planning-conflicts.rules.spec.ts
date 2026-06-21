import { describe, expect, it } from '@jest/globals';
import {
  computeOccupationPercent,
  findScheduleConflict,
  schedulesOverlap,
  validateScheduleInterval,
} from './planning-conflicts.rules';

describe('planning-conflicts.rules (TST-EVOL-002-01..02)', () => {
  const base = new Date('2025-06-16T08:00:00.000Z');
  const noon = new Date('2025-06-16T12:00:00.000Z');
  const afternoon = new Date('2025-06-16T14:00:00.000Z');

  it('TST-EVOL-002-01 — détecte un chevauchement', () => {
    expect(
      schedulesOverlap(
        { startAt: base, endAt: noon },
        { startAt: new Date('2025-06-16T10:00:00.000Z'), endAt: afternoon },
      ),
    ).toBe(true);
    const conflict = findScheduleConflict(
      {
        startAt: new Date('2025-06-16T10:00:00.000Z'),
        endAt: afternoon,
        status: 'PLANNED',
      },
      [{ id: 's1', startAt: base, endAt: noon, status: 'PLANNED' }],
    );
    expect(conflict?.id).toBe('s1');
  });

  it('TST-EVOL-002-02 — ignore les créneaux CANCELLED', () => {
    const conflict = findScheduleConflict(
      {
        startAt: new Date('2025-06-16T10:00:00.000Z'),
        endAt: afternoon,
        status: 'PLANNED',
      },
      [{ id: 's1', startAt: base, endAt: noon, status: 'CANCELLED' }],
    );
    expect(conflict).toBeNull();
  });

  it('TST-EVOL-002-01 — rejette endAt <= startAt', () => {
    expect(validateScheduleInterval(noon, base)).toMatch(/postérieure/);
  });

  it('TST-EVOL-002-06 — calcule le KPI occupation sur 35 h/semaine', () => {
    expect(computeOccupationPercent(17.5, 1)).toBe(50);
  });
});
