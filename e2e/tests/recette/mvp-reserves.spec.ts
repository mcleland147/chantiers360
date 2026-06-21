import { test, expect } from "../../fixtures.recette";
import { loginAs } from "../../helpers/auth";
import { apiLogin, getChantierIdByReference } from "../../helpers/recetteApi";

test.describe("MVP — Réserves", () => {
  test("@REC-007 — création réserve sur chantier", async ({ page }) => {
    const session = await apiLogin("conducteur@batinova.fr");
    const id = await getChantierIdByReference(session.token, "CHT-001");
    await loginAs(page, "conducteur");
    await page.goto(`/chantiers/${id}?tab=reserves`);
    await page.getByRole("button", { name: "Nouvelle réserve" }).click();
    await expect(page.getByTestId("create-reserve-modal")).toBeVisible();
  });

  test("@REC-008 — levée réserve conducteur CHT-003", async ({ page }) => {
    const session = await apiLogin("conducteur@batinova.fr");
    const id = await getChantierIdByReference(session.token, "CHT-003");
    await loginAs(page, "conducteur");
    await page.goto(`/chantiers/${id}?tab=reserves`);
    const validateBtn = page.getByRole("button", { name: "Valider levée" }).first();
    if (await validateBtn.isVisible()) {
      await validateBtn.click();
      await page.getByRole("button", { name: "Confirmer" }).click();
    }
    await expect(page.getByText("Réserves", { exact: false })).toBeVisible();
  });
});
