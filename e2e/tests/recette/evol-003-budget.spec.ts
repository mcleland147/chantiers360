import { test, expect } from "../../fixtures.recette";
import { loginAs } from "../../helpers/auth";
import {
  apiGetBudgetSummary,
  apiGetExpenses,
  apiListChantiers,
  apiGetBudgetSummaryRaw,
  apiLogin,
  getChantierIdByReference,
} from "../../helpers/recetteApi";

test.describe("EVOL-003 — Budget & ressources", () => {
  test("@REC-EVOL-003-01 — synthèse CHT-001 seed (API + UI)", async ({ page }) => {
    const session = await apiLogin("conducteur@batinova.fr");
    const id = await getChantierIdByReference(session.token, "CHT-001");
    const summary = await apiGetBudgetSummary(session.token, id);

    expect(summary.consumptionPercent).toBeGreaterThanOrEqual(80);
    expect(summary.alert80Active).toBe(true);
    expect(summary.budgetConsumed).toBeGreaterThan(0);

    await loginAs(page, "conducteur");
    await page.goto(`/chantiers/${id}?tab=budget`);
    await expect(page.getByTestId("budget-summary-card")).toBeVisible();
    await expect(page.getByTestId("budget-alert-80")).toBeVisible();
  });

  test("@REC-EVOL-003-02 — DRAFT/CANCELLED exclus du consommé (API)", async () => {
    const session = await apiLogin("direction@batinova.fr");
    const id = await getChantierIdByReference(session.token, "CHT-001");
    const summary = await apiGetBudgetSummary(session.token, id);
    const expenses = await apiGetExpenses(session.token, id);

    const validatedSum = expenses
      .filter((e) => e.status === "Validée")
      .reduce((s, e) => s + e.amount, 0);
    const hasNonValidated = expenses.some(
      (e) => e.status === "Brouillon" || e.status === "Annulée",
    );

    expect(hasNonValidated).toBe(true);
    expect(summary.budgetConsumed).toBe(validatedSum);
  });

  test("@REC-EVOL-003-03 — budgetSpent chantiers = dépenses VALIDATED", async () => {
    const session = await apiLogin("direction@batinova.fr");
    const chantiers = await apiListChantiers(session.token);
    const cht001 = chantiers.find((c) => c.reference === "CHT-001");
    expect(cht001).toBeDefined();
    const summary = await apiGetBudgetSummary(session.token, cht001!.id);
    expect(cht001!.budgetSpent).toBe(summary.budgetConsumed);
  });

  test("@REC-EVOL-003-04 — chef lecture seule onglet Budget", async ({ page }) => {
    const session = await apiLogin("chef@batinova.fr");
    const id = await getChantierIdByReference(session.token, "CHT-001");
    await loginAs(page, "chef");
    await page.goto(`/chantiers/${id}?tab=budget`);
    await expect(page.getByTestId("budget-tab")).toBeVisible();
    await expect(page.getByTestId("expense-add-btn")).toHaveCount(0);
  });

  test("@REC-EVOL-003-05 — dashboard direction KPI budget", async ({ page }) => {
    await loginAs(page, "direction");
    await page.goto("/dashboard/direction");
    await expect(page.getByTestId("budget-overview-chart")).toBeVisible();
    await expect(page.getByTestId("kpi-over-80")).toBeVisible();
  });

  test("@REC-EVOL-003-06 — conducteur non référent message accès", async ({ page }) => {
    const session = await apiLogin("conducteur@batinova.fr");
    const id = await getChantierIdByReference(session.token, "CHT-020");
    const apiResult = await apiGetBudgetSummaryRaw(session.token, id);
    expect(apiResult.status).toBe(403);

    await loginAs(page, "conducteur");
    await page.goto(`/chantiers/${id}?tab=budget`);
    await expect(page.getByTestId("budget-access-denied")).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByText("Accès réservé au conducteur référent de ce chantier."),
    ).toBeVisible();
  });
});
