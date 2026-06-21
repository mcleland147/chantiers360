import { test, expect } from "../fixtures";
import { loginAs } from "../helpers/auth";

test.describe("Workflow chantier — Phase G", () => {
  test("E2E-G-001 — création chantier via formulaire", async ({ page }) => {
    await loginAs(page, "conducteur");
    await page.goto("/chantiers/nouveau");

    await page.getByPlaceholder("CHT-099").fill("CHT-099");
    await page.getByLabel("Nom du chantier").fill("Chantier E2E");
    await page.getByLabel("Client", { exact: true }).fill("Client E2E");
    await page.getByLabel("Adresse", { exact: true }).fill("Adresse E2E");
    await page.getByLabel("Date de début").fill("2025-01-01");
    await page.getByLabel("Date fin prévue").fill("2025-12-31");
    await page.getByRole("button", { name: "Créer le chantier" }).click();

    await expect(page).toHaveURL(/\/chantiers\/c-new/, { timeout: 10000 });
    await expect(page.getByText("CHT-099", { exact: true }).first()).toBeVisible();
  });

  test("E2E-G-002 — changement de statut chantier", async ({ page }) => {
    await loginAs(page, "conducteur");
    await page.goto("/chantiers/c-1");

    await page.getByRole("button", { name: "Changer statut" }).click();
    await page
      .getByTestId("change-status-modal")
      .getByRole("combobox")
      .selectOption("Réception");
    await page.getByRole("button", { name: "Confirmer" }).click();

    await expect(
      page.getByText("Réception", { exact: true }).first(),
    ).toBeVisible();
  });
});
