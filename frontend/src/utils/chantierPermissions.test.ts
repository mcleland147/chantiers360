import { describe, expect, it } from "vitest";
import {
  canAddPhoto,
  canAddProgressUpdate,
  canAssignMember,
  canCreateReserve,
  canEditChantier,
  canValidateReserveLevee,
} from "./chantierPermissions";

describe("chantierPermissions", () => {
  it("seul le conducteur peut affecter un membre", () => {
    expect(canAssignMember("CONDUCTEUR_TRAVAUX")).toBe(true);
    expect(canAssignMember("DIRECTION")).toBe(false);
    expect(canAssignMember("CHEF_CHANTIER")).toBe(false);
  });

  it("conducteur et chef peuvent ajouter avancement / photo / réserve", () => {
    expect(canAddProgressUpdate("CONDUCTEUR_TRAVAUX")).toBe(true);
    expect(canAddProgressUpdate("CHEF_CHANTIER")).toBe(true);
    expect(canAddProgressUpdate("DIRECTION")).toBe(false);

    expect(canAddPhoto("CHEF_CHANTIER")).toBe(true);
    expect(canCreateReserve("CHEF_CHANTIER")).toBe(true);
  });

  it("seul le conducteur valide la levée", () => {
    expect(canValidateReserveLevee("CONDUCTEUR_TRAVAUX")).toBe(true);
    expect(canValidateReserveLevee("CHEF_CHANTIER")).toBe(false);
  });

  it("conducteur et assistante peuvent modifier le chantier", () => {
    expect(canEditChantier("ASSISTANTE_ADMINISTRATIVE")).toBe(true);
    expect(canEditChantier("DIRECTION")).toBe(false);
  });
});
