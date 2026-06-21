import { describe, expect, it } from "vitest";
import { extractPlanningApiError } from "../utils/planningErrors";

describe("Planning permissions & errors (TST-EVOL-002-08)", () => {
  it("extrait le message de conflit HTTP 409", () => {
    const message = extractPlanningApiError({
      response: {
        data: {
          message: {
            message:
              "Conflit de planning — Ahmed Benali est déjà affecté sur CHT-001 le 16/06/2025 de 08:00 à 12:00.",
          },
        },
      },
    });
    expect(message).toMatch(/Conflit de planning/);
    expect(message).toMatch(/CHT-001/);
  });
});
