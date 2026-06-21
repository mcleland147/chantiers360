import { test, expect } from "../../fixtures.recette";
import { loginAs } from "../../helpers/auth";
import {
  apiCreatePlanningSlot,
  apiListWorkers,
  apiLogin,
  apiUpdateWorker,
  getChantierIdByReference,
} from "../../helpers/recetteApi";

test.describe("EVOL-002 — Planning ouvriers", () => {
  test("@REC-EVOL-002-01 — conducteur crée un créneau sans conflit", async ({ page }) => {
    await loginAs(page, "conducteur");
    await page.goto("/planning");
    await expect(page.getByRole("heading", { name: "Planning ouvriers" })).toBeVisible();
    await page.getByTestId("planning-new-slot").click();
    await expect(page.getByTestId("slot-modal")).toBeVisible();
    await page.getByTestId("slot-modal").locator('input[type="date"]').fill("2025-06-18");
    await page.getByTestId("slot-modal").locator('input[type="time"]').first().fill("08:00");
    await page.getByTestId("slot-modal").locator('input[type="time"]').nth(1).fill("12:00");
    await page.getByTestId("slot-modal").getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByTestId("slot-modal")).not.toBeVisible({ timeout: 15_000 });
  });

  test("@REC-EVOL-002-02 — conflit bloqué avec message explicite", async ({ page }) => {
    await loginAs(page, "conducteur");
    await page.goto("/planning");
    await page.getByTestId("planning-new-slot").click();
    await page.getByTestId("slot-modal").locator('input[type="date"]').fill("2025-06-16");
    await page.getByTestId("slot-modal").locator('input[type="time"]').first().fill("10:00");
    await page.getByTestId("slot-modal").locator('input[type="time"]').nth(1).fill("14:00");
    await page.getByTestId("slot-modal").getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByTestId("slot-modal-error")).toContainText("Conflit de planning");
    await expect(page.getByTestId("slot-modal-error")).toContainText("CHT-001");
  });

  test("@REC-EVOL-002-03 — filtres chantier et ouvrier présents", async ({ page }) => {
    await loginAs(page, "conducteur");
    await page.goto("/planning");
    await expect(page.getByTestId("planning-filter-chantier")).toBeVisible();
    await expect(page.getByTestId("planning-filter-worker")).toBeVisible();
  });

  test("@REC-EVOL-002-04 — direction lecture seule sans création", async ({ page }) => {
    await loginAs(page, "direction");
    await page.goto("/planning");
    await expect(page.getByTestId("planning-new-slot")).toHaveCount(0);
    await expect(page.getByText("Occupation équipes")).toBeVisible();
  });

  test("@REC-EVOL-002-07 — conducteur : CHT-002 absent du filtre", async ({ page }) => {
    await loginAs(page, "conducteur");
    await page.goto("/planning");
    const filter = page.getByTestId("planning-filter-chantier");
    await expect(filter.locator("option", { hasText: "CHT-002" })).toHaveCount(0);
    await expect(filter.locator("option", { hasText: "CHT-001" })).toHaveCount(1);
  });

  test("@REC-EVOL-002-05 — KPI occupation visible direction", async ({ page }) => {
    await loginAs(page, "direction");
    await page.goto("/planning");
    await expect(page.getByText("Occupation équipes")).toBeVisible();
  });

  test("@REC-EVOL-002-06 — ouvrier inactif absent des listes (API + UI)", async ({
    page,
  }) => {
    const session = await apiLogin("conducteur@batinova.fr");
    const chantierId = await getChantierIdByReference(session.token, "CHT-001");

    const activeWorkers = await apiListWorkers(session.token);
    expect(activeWorkers.some((w) => w.fullName === "Pierre Morel")).toBe(false);
    expect(activeWorkers.some((w) => w.id === "w-5")).toBe(false);

    const slotAttempt = await apiCreatePlanningSlot(session.token, {
      workerId: "w-5",
      projectId: chantierId,
      startAt: "2025-06-28T08:00:00.000Z",
      endAt: "2025-06-28T12:00:00.000Z",
    });
    expect(slotAttempt.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(slotAttempt.body)).toMatch(/inactif/i);

    await apiUpdateWorker(session.token, "w-4", { isActive: false });
    const afterDeactivate = await apiListWorkers(session.token);
    expect(afterDeactivate.some((w) => w.id === "w-4")).toBe(false);
    await apiUpdateWorker(session.token, "w-4", { isActive: true });

    await loginAs(page, "conducteur");
    await page.goto("/planning");
    const workerFilter = page.getByTestId("planning-filter-worker");
    await expect(workerFilter.locator("option", { hasText: "Pierre Morel" })).toHaveCount(0);

    await page.getByTestId("planning-new-slot").click();
    const modalWorkerSelect = page.getByTestId("slot-modal").locator("select").first();
    await expect(modalWorkerSelect.locator("option", { hasText: "Pierre Morel" })).toHaveCount(0);
  });
});
