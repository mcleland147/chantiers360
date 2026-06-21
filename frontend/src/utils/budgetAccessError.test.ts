import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { resolveBudgetTabError } from "./budgetAccessError";

function forbiddenError(message = "Accès chantier refusé.") {
  return new AxiosError(
    "Forbidden",
    "403",
    undefined,
    undefined,
    {
      status: 403,
      data: { message, statusCode: 403 },
    } as never,
  );
}

describe("resolveBudgetTabError", () => {
  it("403 conducteur — message référent", () => {
    const msg = resolveBudgetTabError(
      forbiddenError(),
      "CONDUCTEUR_TRAVAUX",
    );
    expect(msg.description).toBe(
      "Accès réservé au conducteur référent de ce chantier.",
    );
  });

  it("403 chef — message affectation", () => {
    const msg = resolveBudgetTabError(forbiddenError(), "CHEF_CHANTIER");
    expect(msg.description).toContain("équipes affectées");
  });
});
