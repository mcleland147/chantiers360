import { test, expect } from "../fixtures";
import { loginAs } from "../helpers/auth";

test.describe("Badge En retard — RG-001", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "conducteur");
  });

  test("E2E-LATE-001 — badge En retard sur chantier en dépassement", async ({
    page,
  }) => {
    await page.goto("/chantiers");
    const row = page.getByRole("row", { name: /Immeuble Haussmann/ });
    await expect(row.getByText("Réalisation")).toBeVisible();
    await expect(row.getByText("En retard")).toBeVisible();
  });

  test("E2E-LATE-002 — badge sur fiche chantier", async ({ page }) => {
    await page.goto("/chantiers/c-3");
    await expect(page.getByText("En retard").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Informations" }),
    ).toBeVisible();
  });
});

test.describe("Réserves", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "conducteur");
  });

  test("E2E-RSV-001 — onglet réserves sur fiche chantier", async ({ page }) => {
    await page.goto("/chantiers/c-3?tab=reserves");
    await expect(page.locator("h3").filter({ hasText: "Réserves" })).toBeVisible();
    await expect(page.getByText("Fissure mur porteur nord")).toBeVisible();
    await expect(page.getByText("Critique").first()).toBeVisible();
    await expect(page.getByText("En cours").first()).toBeVisible();
  });

  test("E2E-RSV-002 — réserves récentes sur dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Réserves récentes")).toBeVisible();
    await expect(page.getByText("Fissure mur porteur nord")).toBeVisible();
  });
});
