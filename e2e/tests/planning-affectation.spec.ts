import { test, expect } from "../fixtures";
import { loginAs } from "../helpers/auth";
import { resetPlanningMockState } from "../helpers/mockPlanningApi";

test.describe("Planning ouvriers — TST-EVOL-002-08", () => {
  test.beforeEach(() => {
    resetPlanningMockState();
  });

  test("E2E-EVOL-002-01 — conducteur crée un créneau sans conflit", async ({ page }) => {
    await loginAs(page, "conducteur");
    await page.goto("/planning");

    await expect(page.getByRole("heading", { name: "Planning ouvriers" })).toBeVisible();
    await page.getByTestId("planning-new-slot").click();
    await expect(page.getByTestId("slot-modal")).toBeVisible();

    await page.getByTestId("slot-modal").locator('input[type="date"]').fill("2025-06-18");
    await page.getByTestId("slot-modal").locator('input[type="time"]').first().fill("08:00");
    await page.getByTestId("slot-modal").locator('input[type="time"]').nth(1).fill("12:00");
    await page.getByTestId("slot-modal").getByRole("button", { name: "Enregistrer" }).click();

    await expect(page.getByTestId("slot-modal")).not.toBeVisible();
  });

  test("E2E-EVOL-002-02 — conflit bloqué avec message explicite", async ({ page }) => {
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

  test("E2E-EVOL-002-03 — filtres chantier et ouvrier", async ({ page }) => {
    await loginAs(page, "conducteur");
    await page.goto("/planning");

    await page.getByTestId("planning-filter-chantier").selectOption("c-1");
    await page.getByTestId("planning-filter-worker").selectOption("w-1");
    await expect(page.getByTestId("planning-filter-chantier")).toHaveValue("c-1");
    await expect(page.getByTestId("planning-filter-worker")).toHaveValue("w-1");
  });

  test("E2E-EVOL-002-04 — direction en lecture seule sans bouton création", async ({ page }) => {
    await loginAs(page, "direction");
    await page.goto("/planning");

    await expect(page.getByRole("heading", { name: "Planning ouvriers" })).toBeVisible();
    await expect(page.getByTestId("planning-new-slot")).toHaveCount(0);
    await expect(page.getByText("Occupation équipes")).toBeVisible();
  });
});
