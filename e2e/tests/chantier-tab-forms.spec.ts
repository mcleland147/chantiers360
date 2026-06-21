import { test, expect } from "../fixtures";
import { loginAs } from "../helpers/auth";

test.describe("Formulaires onglets — T-G-TABS-FORMS", () => {
  test("E2E-G-FORMS-001 — affectation membre (conducteur)", async ({ page }) => {
    await loginAs(page, "conducteur");
    await page.goto("/chantiers/c-3?tab=equipes");

    await page.getByRole("button", { name: "Affecter un membre" }).click();
    await expect(page.getByTestId("assign-member-modal")).toBeVisible();
    await page.getByTestId("assign-member-modal").getByRole("combobox").selectOption("u-chef-2");
    await page
      .getByPlaceholder("Chef de chantier, Électricien…")
      .fill("Électricien");
    await page.getByTestId("assign-member-modal").getByRole("button", { name: "Affecter" }).click();

    await expect(page.getByRole("cell", { name: "Paul Lefèvre" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Électricien" })).toBeVisible();
  });

  test("E2E-G-FORMS-002 — ajout mise à jour avancement", async ({ page }) => {
    await loginAs(page, "conducteur");
    await page.goto("/chantiers/c-3?tab=avancement");

    await page.getByRole("button", { name: "Ajouter une mise à jour" }).click();
    await page
      .getByPlaceholder(/avancement terrain/i)
      .fill("Coulage dalle R+4 terminé");
    await page.getByPlaceholder("0 – 100").fill("48");
    await page.getByRole("button", { name: "Enregistrer" }).click();

    await expect(page.getByText("Coulage dalle R+4 terminé")).toBeVisible();
    await expect(page.getByText("48 %")).toBeVisible();
  });

  test("E2E-G-FORMS-003 — création réserve", async ({ page }) => {
    await loginAs(page, "conducteur");
    await page.goto("/chantiers/c-3?tab=reserves");

    await page.getByRole("button", { name: "Nouvelle réserve" }).click();
    await page
      .getByPlaceholder(/Description courte/i)
      .fill("Infiltration toiture est");
    await page.getByRole("button", { name: "Créer la réserve" }).click();

    await expect(page.getByText("Infiltration toiture est")).toBeVisible();
    await expect(page.getByText("Ouverte").first()).toBeVisible();
  });

  test("E2E-G-FORMS-004 — ajout photo par URL", async ({ page }) => {
    await loginAs(page, "chef");
    await page.goto("/chantiers/c-3?tab=photos");

    await page.getByRole("button", { name: "Ajouter une photo" }).click();
    await page.getByPlaceholder("facade-sud.jpg").fill("facade-sud-e2e.jpg");
    await page.getByTestId("add-photo-modal").getByRole("combobox").selectOption("Pendant travaux");
    await page.getByTestId("add-photo-modal").getByRole("button", { name: "Ajouter" }).click();

    await expect(page.getByText("facade-sud-e2e.jpg")).toBeVisible();
  });

  test("E2E-G-FORMS-005 — chef ne voit pas Affecter un membre", async ({
    page,
  }) => {
    await loginAs(page, "chef");
    await page.goto("/chantiers/c-3?tab=equipes");
    await expect(
      page.getByRole("button", { name: "Affecter un membre" }),
    ).toHaveCount(0);
  });
});
