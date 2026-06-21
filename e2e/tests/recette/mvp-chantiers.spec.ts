import { test, expect } from "../../fixtures.recette";
import { loginAs } from "../../helpers/auth";
import {
  apiChangeChantierStatus,
  apiLogin,
  apiPatchChantier,
  getChantierIdByReference,
} from "../../helpers/recetteApi";

test.describe("MVP — Chantiers", () => {
  test("@REC-001 — création chantier statut Préparation", async ({ page }) => {
    await loginAs(page, "conducteur");
    const ref = `CHT-${900000 + (Date.now() % 99999)}`;
    await page.goto("/chantiers/nouveau");

    await page.getByPlaceholder("CHT-099").fill(ref);
    await page.getByLabel("Nom du chantier").fill("Chantier recette auto");
    await page.getByLabel("Client", { exact: true }).fill("Client recette");
    await page.getByLabel("Adresse", { exact: true }).fill("1 rue Test, Lyon");
    await page.getByLabel("Date de début").fill("2025-01-01");
    await page.getByLabel("Date fin prévue").fill("2025-12-31");
    await page.getByRole("button", { name: "Créer le chantier" }).click();

    await expect(page).toHaveURL(/\/chantiers\/[a-f0-9-]+/, { timeout: 15_000 });
    await expect(page.getByText(ref, { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Préparation", { exact: true }).first()).toBeVisible();
  });

  test("@REC-010 — historique chantier seedé CHT-001", async ({ page }) => {
    const session = await apiLogin("direction@batinova.fr");
    const id = await getChantierIdByReference(session.token, "CHT-001");
    await loginAs(page, "direction");
    await page.goto(`/chantiers/${id}?tab=historique`);
    await expect(page.getByText("Création chantier")).toBeVisible();
  });

  test("@REC-011 — dashboard conducteur KPI visibles", async ({ page }) => {
    await loginAs(page, "conducteur");
    await page.goto("/dashboard");
    await expect(page.getByText("Chantiers actifs", { exact: true })).toBeVisible();
    await expect(page.getByText("Réserves ouvertes", { exact: true })).toBeVisible();
  });

  test("@REC-012 — dashboard direction consolidé", async ({ page }) => {
    await loginAs(page, "direction");
    await page.goto("/dashboard/direction");
    await expect(page.getByTestId("budget-overview-chart")).toBeVisible();
    await expect(page.getByText("Vue budget")).toBeVisible();
  });

  test("@REC-005 — affectation membre équipe", async ({ page }) => {
    const session = await apiLogin("conducteur@batinova.fr");
    const id = await getChantierIdByReference(session.token, "CHT-005");
    await loginAs(page, "conducteur");
    await page.goto(`/chantiers/${id}?tab=equipes`);
    await page.getByRole("button", { name: "Affecter un membre" }).click();
    await expect(page.getByTestId("assign-member-modal")).toBeVisible();
  });

  test("@REC-002 — modification chantier (API)", async () => {
    const session = await apiLogin("conducteur@batinova.fr");
    const id = await getChantierIdByReference(session.token, "CHT-001");
    const result = await apiPatchChantier(session.token, id, {
      client: "Client recette auto",
    });
    expect(result.status).toBe(200);
    expect(result.body?.client).toBe("Client recette auto");
  });

  test("@REC-003 — changement statut avant (API)", async () => {
    const session = await apiLogin("conducteur@batinova.fr");
    const id = await getChantierIdByReference(session.token, "CHT-005");
    const result = await apiChangeChantierStatus(
      session.token,
      id,
      "Réalisation",
    );
    expect(result.status).toBe(200);
    expect(result.body?.status).toBe("Réalisation");
  });

  test("@REC-004 — retour arrière sans motif refusé (API)", async () => {
    const session = await apiLogin("conducteur@batinova.fr");
    const id = await getChantierIdByReference(session.token, "CHT-005");
    await apiChangeChantierStatus(session.token, id, "Réalisation");
    const withoutReason = await apiChangeChantierStatus(
      session.token,
      id,
      "Démarrage",
    );
    expect(withoutReason.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(withoutReason.body)).toMatch(/RG-DATA-004|motif/i);
    const withReason = await apiChangeChantierStatus(
      session.token,
      id,
      "Démarrage",
      "Ajustement planning recette",
    );
    expect(withReason.status).toBe(200);
  });

  test("@REC-013 — refus clôture avec réserves ouvertes (API)", async () => {
    const session = await apiLogin("conducteur@batinova.fr");
    const id = await getChantierIdByReference(session.token, "CHT-003");
    await apiChangeChantierStatus(session.token, id, "Réception");
    const result = await apiChangeChantierStatus(session.token, id, "Clôture");
    expect(result.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(result.body)).toMatch(/réserve|RG-REC-013|REC-013/i);
  });

  test("@REC-006 — ajout avancement", async ({ page }) => {
    const session = await apiLogin("conducteur@batinova.fr");
    const id = await getChantierIdByReference(session.token, "CHT-001");
    await loginAs(page, "conducteur");
    await page.goto(`/chantiers/${id}?tab=avancement`);
    await page.getByRole("button", { name: "Ajouter une mise à jour" }).click();
    await expect(page.getByTestId("add-progress-modal")).toBeVisible();
  });
});
