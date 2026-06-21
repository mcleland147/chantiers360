import { test, expect } from "../../fixtures.recette";
import { loginAs, TEST_USERS } from "../../helpers/auth";
import { apiGetMe, apiLogin } from "../../helpers/recetteApi";

test.describe("MVP — Authentification @REC-014 @REC-015", () => {
  test("@REC-015 — connexion JWT et session conducteur", async ({ page }) => {
    await loginAs(page, "conducteur");
    await expect(page).toHaveURL(/\/dashboard$/);
    const session = await apiLogin(TEST_USERS.conducteur.email);
    const me = await apiGetMe(session.token);
    expect(me.email).toBe(TEST_USERS.conducteur.email);
    expect(me.role).toBeTruthy();
  });

  test("@REC-014 — conducteur refusé sur dashboard direction", async ({ page }) => {
    await loginAs(page, "conducteur");
    await page.goto("/dashboard/direction");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("@REC-014 — direction accès dashboard direction", async ({ page }) => {
    await loginAs(page, "direction");
    await expect(page).toHaveURL(/\/dashboard\/direction/);
  });

  test("@REC-014 — assistante redirigée vers chantiers", async ({ page }) => {
    await loginAs(page, "assistante");
    await expect(page).toHaveURL(/\/chantiers$/);
  });

  test("@REC-014 — chef redirigé vers mobile", async ({ page }) => {
    await loginAs(page, "chef");
    await expect(page).toHaveURL(/\/mobile/);
  });

  test("@REC-015 — identifiants invalides", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("conducteur@batinova.fr");
    await page.locator("#password").fill("wrong-password");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(
      page.getByText("Adresse e-mail ou mot de passe incorrect."),
    ).toBeVisible();
  });
});
