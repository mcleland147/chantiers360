import { test, expect } from "../fixtures";
import { loginAs } from "../helpers/auth";

test.describe("Upload photos — TST-R11-A-09", () => {
  test("E2E-R11-A-09 — parcours upload photo fiche chantier", async ({ page }) => {
    await loginAs(page, "conducteur");
    await page.goto("/chantiers/c-3?tab=photos");

    await page.getByRole("button", { name: "Ajouter une photo" }).click();
    await expect(page.getByTestId("add-photo-modal")).toBeVisible();

    await page.getByTestId("photo-file-input").setInputFiles({
      name: "chantier-facade.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-jpeg"),
    });

    await page.getByTestId("add-photo-modal").getByRole("combobox").selectOption("Après travaux");
    await page.getByTestId("add-photo-modal").getByRole("button", { name: "Envoyer" }).click();

    await expect(page.getByTestId("add-photo-modal")).not.toBeVisible();
    await expect(page.getByText("facade-e2e.jpg")).toBeVisible();
  });
});
