import { describe, expect, it } from "vitest";
import {
  canAddPhoto,
  canAddProgressUpdate,
  canAssignMember,
  canCreateReserve,
} from "./chantierPermissions";

describe("Permissions formulaires onglets — T-G-FORMS-ROLE", () => {
  it("T-G-FORMS-ROLE-001 — affectation réservée au conducteur", () => {
    expect(canAssignMember("CONDUCTEUR_TRAVAUX")).toBe(true);
    expect(canAssignMember("CHEF_CHANTIER")).toBe(false);
    expect(canAssignMember("ASSISTANTE_ADMINISTRATIVE")).toBe(false);
  });

  it("T-G-FORMS-ROLE-002 — avancement conducteur et chef", () => {
    expect(canAddProgressUpdate("CONDUCTEUR_TRAVAUX")).toBe(true);
    expect(canAddProgressUpdate("CHEF_CHANTIER")).toBe(true);
    expect(canAddProgressUpdate("DIRECTION")).toBe(false);
  });

  it("T-G-FORMS-ROLE-003 — réserve et photo conducteur et chef", () => {
    expect(canCreateReserve("CHEF_CHANTIER")).toBe(true);
    expect(canCreateReserve("DIRECTION")).toBe(false);
    expect(canAddPhoto("CHEF_CHANTIER")).toBe(true);
    expect(canAddPhoto("ASSISTANTE_ADMINISTRATIVE")).toBe(false);
  });
});
