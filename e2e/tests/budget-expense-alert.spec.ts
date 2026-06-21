import { test, expect } from "../fixtures";
import { loginAs } from "../helpers/auth";
import { resetBudgetMockState } from "../helpers/mockBudgetApi";

test.describe("Budget chantier — TST-EVOL-003-07", () => {
  test.beforeEach(() => {
    resetBudgetMockState();
  });

  test("E2E-EVOL-003-01 — onglet Budget affiche synthèse et dépenses", async ({ page }) => {
    await loginAs(page, "conducteur");
    await page.goto("/chantiers/c-1?tab=budget");

    await expect(page.getByTestId("budget-tab")).toBeVisible();
    await expect(page.getByTestId("budget-summary-card")).toBeVisible();
    await expect(page.getByTestId("expense-table")).toBeVisible();
    await expect(page.getByTestId("budget-percent")).toHaveText("79%");
  });

  test("E2E-EVOL-003-02 — ajout dépense déclenche alerte 80 %", async ({ page }) => {
    await loginAs(page, "conducteur");
    await page.goto("/chantiers/c-1?tab=budget");

    await page.getByTestId("expense-add-btn").click();
    await page.getByTestId("expense-label").fill("Matériaux complément");
    await page.getByTestId("expense-amount").fill("5000");
    await page.getByTestId("expense-date").fill("2025-06-21");
    await page.getByTestId("expense-submit").click();

    await expect(page.getByTestId("budget-alert-80")).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("budget-percent")).toHaveText("84%");
  });

  test("E2E-EVOL-003-03 — chef lecture seule sans bouton ajout", async ({ page }) => {
    await loginAs(page, "chef");
    await page.goto("/chantiers/c-1?tab=budget");

    await expect(page.getByTestId("budget-tab")).toBeVisible();
    await expect(page.getByTestId("expense-add-btn")).toHaveCount(0);
    await expect(page.getByTestId("resource-add-btn")).toHaveCount(0);
  });
});
