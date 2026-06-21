import { test, expect } from "../fixtures";
import { loginAs } from "../helpers/auth";

test.describe("Dashboard conducteur", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "conducteur");
  });

  test("E2E-DASH-001 — affiche les KPI chantiers", async ({ page }) => {
    await expect(page.getByText("Chantiers actifs", { exact: true })).toBeVisible();
    await expect(page.getByText("Chantiers en retard", { exact: true })).toBeVisible();
    await expect(page.getByText("Réserves ouvertes", { exact: true })).toBeVisible();
  });

  test("E2E-DASH-002 — liste les chantiers récents", async ({ page }) => {
    await expect(
      page.getByText("Chantiers récemment mis à jour"),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Résidence Les Oliviers/ }),
    ).toBeVisible();
  });

  test("E2E-NAV-001 — navigation dashboard → fiche chantier", async ({
    page,
  }) => {
    await page.getByRole("link", { name: /Résidence Les Oliviers/ }).click();
    await expect(page).toHaveURL(/\/chantiers\/c-1/);
    await expect(
      page.getByRole("button", { name: "Informations" }),
    ).toBeVisible();
  });
});

test.describe("Dashboard direction — Phase F", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "direction");
  });

  test("E2E-DASH-003 — redirection vers /dashboard/direction", async ({
    page,
  }) => {
    await expect(page).toHaveURL(/\/dashboard\/direction/);
    await expect(page.getByTestId("dashboard-direction")).toBeVisible();
  });

  test("E2E-DASH-004 — affiche les KPI consolidés direction", async ({
    page,
  }) => {
    const kpiGrid = page.getByTestId("direction-kpi-grid");
    await expect(kpiGrid.getByText("Total chantiers", { exact: true })).toBeVisible();
    await expect(
      kpiGrid.getByText("Chantiers en retard", { exact: true }),
    ).toBeVisible();
    await expect(
      kpiGrid.getByText("Réserves ouvertes", { exact: true }),
    ).toBeVisible();
    await expect(
      kpiGrid.getByText("Réserves critiques", { exact: true }),
    ).toBeVisible();
    await expect(page.getByTestId("status-distribution-chart")).toBeVisible();
    await expect(page.getByTestId("risk-chantiers-list")).toBeVisible();
    await expect(page.getByTestId("budget-overview-chart")).toBeVisible();
  });

  test("E2E-DASH-005 — drill-down fiche chantier depuis chantiers à risque", async ({
    page,
  }) => {
    await page
      .getByRole("link", { name: /Immeuble Haussmann/ })
      .click();
    await expect(page).toHaveURL(/\/chantiers\/c-3/);
    await expect(
      page.getByRole("button", { name: "Informations" }),
    ).toBeVisible();
  });

  test("E2E-DASH-006 — consultation seule sans actions de modification", async ({
    page,
  }) => {
    await expect(page.getByText(/Consultation seule/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Créer|Modifier|Supprimer/i }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /Ajouter/i }),
    ).toHaveCount(0);
  });
});
