import { test, expect } from "../fixtures";
import { loginAs, TEST_USERS } from "../helpers/auth";

test.describe("Connexion par rôle", () => {
  test("E2E-AUTH-001 — conducteur → /dashboard", async ({ page }) => {
    await loginAs(page, "conducteur");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText("Chantiers actifs", { exact: true })).toBeVisible();
  });

  test("E2E-AUTH-002 — direction → /dashboard/direction", async ({ page }) => {
    await loginAs(page, "direction");
    await expect(page).toHaveURL(/\/dashboard\/direction/);
  });

  test("E2E-AUTH-003 — assistante → /chantiers", async ({ page }) => {
    await loginAs(page, "assistante");
    await expect(page).toHaveURL(/\/chantiers$/);
    await expect(page.locator("h2").filter({ hasText: "Chantiers" })).toBeVisible();
  });

  test("E2E-AUTH-004 — chef de chantier → /mobile", async ({ page }) => {
    await loginAs(page, "chef");
    await expect(page).toHaveURL(/\/mobile/);
  });

  test("E2E-AUTH-005 — identifiants invalides affichent une erreur", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.locator("#email").fill("conducteur@batinova.fr");
    await page.locator("#password").fill("wrong-password");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(
      page.getByText("Adresse e-mail ou mot de passe incorrect."),
    ).toBeVisible();
  });

  test("E2E-AUTH-006 — déconnexion retourne au login", async ({ page }) => {
    await loginAs(page, "conducteur");
    await page.getByRole("button", { name: "Déconnexion" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("E2E-AUTH-008 — accès refusé si non connecté", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/chantiers");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Redirections post-login", () => {
  for (const [role, user] of Object.entries(TEST_USERS)) {
    test(`E2E-AUTH-007-${role} — route par défaut ${user.defaultRoute}`, async ({
      page,
    }) => {
      await loginAs(page, role as keyof typeof TEST_USERS);
      await expect(page).toHaveURL(new RegExp(`${user.defaultRoute}$`));
    });
  }
});
