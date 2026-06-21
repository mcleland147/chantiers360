import { test, expect } from "../fixtures";
import { loginAs } from "../helpers/auth";

test.describe("Restriction des routes par rôle", () => {
  test("E2E-ROLE-001 — conducteur bloqué sur /dashboard/direction", async ({
    page,
  }) => {
    await loginAs(page, "conducteur");
    await page.goto("/dashboard/direction");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("E2E-ROLE-002 — direction bloquée sur /dashboard conducteur", async ({
    page,
  }) => {
    await loginAs(page, "direction");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard\/direction/);
  });

  test("E2E-ROLE-003 — assistante bloquée sur /dashboard", async ({ page }) => {
    await loginAs(page, "assistante");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/chantiers$/);
  });

  test("E2E-ROLE-004 — chef bloqué sur /dashboard", async ({ page }) => {
    await loginAs(page, "chef");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/mobile/);
  });

  test("E2E-ROLE-005 — /reports inaccessible pour le conducteur", async ({
    page,
  }) => {
    await loginAs(page, "conducteur");
    await page.goto("/reports");
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
