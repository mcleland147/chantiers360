import { test, expect } from "../../fixtures.recette";
import { loginAs } from "../../helpers/auth";
import {
  apiLogin,
  apiUploadPhoto,
  apiDeletePhoto,
  apiGetChantierHistory,
  getChantierIdByReference,
} from "../../helpers/recetteApi";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

test.describe("EVOL-001 — Upload photos", () => {
  test("@REC-EVOL-001-01 — upload JPG fiche chantier", async ({ page }) => {
    const session = await apiLogin("conducteur@batinova.fr");
    const id = await getChantierIdByReference(session.token, "CHT-001");
    await loginAs(page, "conducteur");
    await page.goto(`/chantiers/${id}?tab=photos`);

    const tmpFile = path.join(os.tmpdir(), `recette-photo-${Date.now()}.jpg`);
    fs.writeFileSync(tmpFile, Buffer.from([0xff, 0xd8, 0xff, 0xd9]));

    await page.getByRole("button", { name: "Ajouter une photo" }).click();
    await page.getByTestId("photo-file-input").setInputFiles(tmpFile);
    await page
      .getByTestId("add-photo-modal")
      .getByRole("combobox")
      .selectOption({ label: "Pendant travaux" });
    await page
      .getByTestId("add-photo-modal")
      .getByRole("button", { name: "Envoyer" })
      .click();

    await expect(page.getByTestId("add-photo-modal")).not.toBeVisible({
      timeout: 15_000,
    });
    fs.unlinkSync(tmpFile);
  });

  test("@REC-EVOL-001-02 — refus fichier > 10 Mo (API)", async () => {
    const session = await apiLogin("conducteur@batinova.fr");
    const id = await getChantierIdByReference(session.token, "CHT-001");
    const oversized = Buffer.alloc(10 * 1024 * 1024 + 1, 0xff);
    const result = await apiUploadPhoto(
      session.token,
      id,
      oversized,
      "too-large.jpg",
    );
    expect(result.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(result.body)).toMatch(
      /10 Mo|Taille maximale|File too large|Payload Too Large|413/i,
    );
  });

  test("@REC-EVOL-001-03 — suppression photo + trace historique (API + UI)", async ({
    page,
  }) => {
    const session = await apiLogin("conducteur@batinova.fr");
    const chantierId = await getChantierIdByReference(session.token, "CHT-001");
    const filename = `recette-delete-${Date.now()}.jpg`;

    const upload = await apiUploadPhoto(
      session.token,
      chantierId,
      Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
      filename,
    );
    expect(upload.status).toBe(201);
    const photos = upload.body as Array<{ id: string; fileName: string }>;
    expect(photos.length).toBeGreaterThan(0);
    const photoId = photos[0]!.id;

    const deleted = await apiDeletePhoto(session.token, photoId);
    expect(deleted.status).toBe(204);

    const history = await apiGetChantierHistory(session.token, chantierId);
    const deletionEvent = history.find((e) => e.action === "Suppression photo");
    expect(deletionEvent).toBeDefined();
    expect(deletionEvent!.oldValue).toBe(filename);

    await loginAs(page, "conducteur");
    await page.goto(`/chantiers/${chantierId}?tab=historique`);
    await expect(page.getByText("Suppression photo")).toBeVisible();
  });

  test("@REC-EVOL-001-04 — chef accès upload mobile / photos", async ({ page }) => {
    await loginAs(page, "chef");
    await page.goto("/mobile");
    await expect(page.getByRole("heading", { name: "Vue mobile" })).toBeVisible();
    await expect(page.getByText("Mes chantiers")).toBeVisible();
    await expect(page.getByRole("button", { name: /Photo/i })).toBeVisible();
  });

  test("@REC-EVOL-001-05 — galerie globale photos", async ({ page }) => {
    await loginAs(page, "direction");
    await page.goto("/photos");
    await expect(page.getByRole("heading", { name: "Photos" })).toBeVisible();
    await expect(page.getByText("Chantier").first()).toBeVisible();
  });
});
