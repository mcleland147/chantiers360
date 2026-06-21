import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  isChantierLate,
  isChantierLateFromEntity,
} from "./chantierRules";
import type { Chantier } from "../types/domain";

describe("chantierRules — RG-001", () => {
  const baseChantier: Chantier = {
    id: "c-1",
    reference: "CHT-001",
    name: "Test",
    client: "Client",
    address: "Adresse",
    conductorName: "Conducteur",
    status: "Réalisation",
    startDate: "01/01/2024",
    expectedEndDate: "01/01/2020",
    openReservesCount: 0,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-20"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retourne true si date fin dépassée et statut ≠ Clôture", () => {
    expect(isChantierLate("01/01/2020", "Réalisation")).toBe(true);
  });

  it("retourne false si statut Clôture même si date dépassée", () => {
    expect(isChantierLate("01/01/2020", "Clôture")).toBe(false);
  });

  it("retourne false si date fin dans le futur", () => {
    expect(isChantierLate("31/12/2026", "Réalisation")).toBe(false);
  });

  it("isChantierLateFromEntity délègue correctement", () => {
    expect(isChantierLateFromEntity(baseChantier)).toBe(true);
    expect(
      isChantierLateFromEntity({ ...baseChantier, status: "Clôture" }),
    ).toBe(false);
  });
});
