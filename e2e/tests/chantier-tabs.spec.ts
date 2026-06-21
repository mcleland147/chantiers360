import { test, expect } from "../fixtures";
import { loginAs } from "../helpers/auth";

test.describe("Onglets fiche chantier — T-G-TABS", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "conducteur");
  });

  test("E2E-G-TABS-001 — onglet équipes via API", async ({ page }) => {
    await page.goto("/chantiers/c-3?tab=equipes");
    await expect(
      page.locator("h3").filter({ hasText: "Affectations équipe" }),
    ).toBeVisible();
    await expect(page.getByText("Jean Moreau")).toBeVisible();
    await expect(page.getByText("Chef de chantier")).toBeVisible();
  });

  test("E2E-G-TABS-002 — onglet avancement via API", async ({ page }) => {
    await page.goto("/chantiers/c-3?tab=avancement");
    await expect(
      page.locator("h3").filter({ hasText: "Journal d'avancement" }),
    ).toBeVisible();
    await expect(page.getByText(/Ravalement façade nord/)).toBeVisible();
    await expect(page.getByText("45 %")).toBeVisible();
  });

  test("E2E-G-TABS-003 — validation levée réserve", async ({ page }) => {
    await page.goto("/chantiers/c-3?tab=reserves");
    await expect(page.getByText("Fissure mur porteur nord")).toBeVisible();
    await page
      .getByRole("button", { name: "Valider la levée" })
      .first()
      .click();
    await expect(
      page.getByText("Levée", { exact: true }).first(),
    ).toBeVisible();
  });

  test("E2E-G-TABS-004 — onglet photos via API", async ({ page }) => {
    await page.goto("/chantiers/c-3?tab=photos");
    await expect(
      page.locator("h3").filter({ hasText: "Photothèque du chantier" }),
    ).toBeVisible();
    await expect(page.getByText("ravalement-nord.jpg")).toBeVisible();
  });
});
