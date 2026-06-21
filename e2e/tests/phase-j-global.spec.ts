import { test, expect } from "../fixtures";
import { loginAs } from "../helpers/auth";

test.describe("Vue globale réserves — Phase J", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "conducteur");
  });

  test("E2E-J-RSV-001 — page /reserves avec filtres", async ({ page }) => {
    await page.goto("/reserves");

    await expect(page.getByRole("heading", { name: "Réserves", level: 1 })).toBeVisible();
    await expect(page.getByPlaceholder(/Recherche/i)).toBeVisible();
    await expect(page.getByText(/Fissure mur porteur nord/i)).toBeVisible();
  });
});

test.describe("Vue globale photos — Phase J", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "conducteur");
  });

  test("E2E-J-PHO-001 — page /photos avec galerie", async ({ page }) => {
    await page.goto("/photos");

    await expect(page.getByText("Chantier").first()).toBeVisible();
    await expect(page.getByText(/ravalement-nord/i)).toBeVisible();
  });
});

test.describe("Vue mobile chef — Phase J", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "chef");
  });

  test("E2E-J-MOB-001 — actions terrain chef", async ({ page }) => {
    await page.goto("/mobile");

    await expect(page.getByText(/Mes chantiers/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Avancement/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Photo/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Réserve", exact: true })).toBeVisible();
  });
});
