# Rapport recette automatisée — 2026-06-21

**Généré par :** `scripts/generate-recette-report.mjs`  
**Source :** `e2e/recette-results.json`  
**Stack :** API réelle + PostgreSQL seedé + JWT (aucun mock)

---

## Synthèse

| Indicateur | Valeur |
|------------|--------|
| Scénarios exécutés | 36 |
| Passés | 36 |
| Échoués | 0 |
| Ignorés | 0 |
| Taux de succès | 100 % |

---

## Détail par scénario

| ID REC | Statut | Durée (ms) | Fichier test | Titre |
|--------|--------|------------|--------------|-------|
| REC-EVOL-001-01 | ✅ passed | 1080 | `evol-001-photos.spec.ts` | @REC-EVOL-001-01 — upload JPG fiche chantier |
| REC-EVOL-001-02 | ✅ passed | 78 | `evol-001-photos.spec.ts` | @REC-EVOL-001-02 — refus fichier > 10 Mo (API) |
| REC-EVOL-001-03 | ✅ passed | 527 | `evol-001-photos.spec.ts` | @REC-EVOL-001-03 — suppression photo + trace historique (API + UI) |
| REC-EVOL-001-04 | ✅ passed | 446 | `evol-001-photos.spec.ts` | @REC-EVOL-001-04 — chef accès upload mobile / photos |
| REC-EVOL-001-05 | ✅ passed | 461 | `evol-001-photos.spec.ts` | @REC-EVOL-001-05 — galerie globale photos |
| REC-EVOL-002-01 | ✅ passed | 614 | `evol-002-planning.spec.ts` | @REC-EVOL-002-01 — conducteur crée un créneau sans conflit |
| REC-EVOL-002-02 | ✅ passed | 543 | `evol-002-planning.spec.ts` | @REC-EVOL-002-02 — conflit bloqué avec message explicite |
| REC-EVOL-002-03 | ✅ passed | 424 | `evol-002-planning.spec.ts` | @REC-EVOL-002-03 — filtres chantier et ouvrier présents |
| REC-EVOL-002-04 | ✅ passed | 454 | `evol-002-planning.spec.ts` | @REC-EVOL-002-04 — direction lecture seule sans création |
| REC-EVOL-002-07 | ✅ passed | 436 | `evol-002-planning.spec.ts` | @REC-EVOL-002-07 — conducteur : CHT-002 absent du filtre |
| REC-EVOL-002-05 | ✅ passed | 450 | `evol-002-planning.spec.ts` | @REC-EVOL-002-05 — KPI occupation visible direction |
| REC-EVOL-002-06 | ✅ passed | 549 | `evol-002-planning.spec.ts` | @REC-EVOL-002-06 — ouvrier inactif absent des listes (API + UI) |
| REC-EVOL-003-01 | ✅ passed | 565 | `evol-003-budget.spec.ts` | @REC-EVOL-003-01 — synthèse CHT-001 seed (API + UI) |
| REC-EVOL-003-02 | ✅ passed | 73 | `evol-003-budget.spec.ts` | @REC-EVOL-003-02 — DRAFT/CANCELLED exclus du consommé (API) |
| REC-EVOL-003-03 | ✅ passed | 65 | `evol-003-budget.spec.ts` | @REC-EVOL-003-03 — budgetSpent chantiers = dépenses VALIDATED |
| REC-EVOL-003-04 | ✅ passed | 575 | `evol-003-budget.spec.ts` | @REC-EVOL-003-04 — chef lecture seule onglet Budget |
| REC-EVOL-003-05 | ✅ passed | 473 | `evol-003-budget.spec.ts` | @REC-EVOL-003-05 — dashboard direction KPI budget |
| REC-EVOL-003-06 | ✅ passed | 7851 | `evol-003-budget.spec.ts` | @REC-EVOL-003-06 — conducteur non référent message accès |
| REC-015 | ✅ passed | 432 | `mvp-auth.spec.ts` | @REC-015 — connexion JWT et session conducteur |
| REC-014 | ✅ passed | 382 | `mvp-auth.spec.ts` | @REC-014 — conducteur refusé sur dashboard direction |
| REC-014 | ✅ passed | 350 | `mvp-auth.spec.ts` | @REC-014 — direction accès dashboard direction |
| REC-014 | ✅ passed | 369 | `mvp-auth.spec.ts` | @REC-014 — assistante redirigée vers chantiers |
| REC-014 | ✅ passed | 330 | `mvp-auth.spec.ts` | @REC-014 — chef redirigé vers mobile |
| REC-015 | ✅ passed | 353 | `mvp-auth.spec.ts` | @REC-015 — identifiants invalides |
| REC-001 | ✅ passed | 527 | `mvp-chantiers.spec.ts` | @REC-001 — création chantier statut Préparation |
| REC-010 | ✅ passed | 498 | `mvp-chantiers.spec.ts` | @REC-010 — historique chantier seedé CHT-001 |
| REC-011 | ✅ passed | 431 | `mvp-chantiers.spec.ts` | @REC-011 — dashboard conducteur KPI visibles |
| REC-012 | ✅ passed | 454 | `mvp-chantiers.spec.ts` | @REC-012 — dashboard direction consolidé |
| REC-005 | ✅ passed | 545 | `mvp-chantiers.spec.ts` | @REC-005 — affectation membre équipe |
| REC-002 | ✅ passed | 83 | `mvp-chantiers.spec.ts` | @REC-002 — modification chantier (API) |
| REC-003 | ✅ passed | 73 | `mvp-chantiers.spec.ts` | @REC-003 — changement statut avant (API) |
| REC-004 | ✅ passed | 80 | `mvp-chantiers.spec.ts` | @REC-004 — retour arrière sans motif refusé (API) |
| REC-013 | ✅ passed | 81 | `mvp-chantiers.spec.ts` | @REC-013 — refus clôture avec réserves ouvertes (API) |
| REC-006 | ✅ passed | 550 | `mvp-chantiers.spec.ts` | @REC-006 — ajout avancement |
| REC-007 | ✅ passed | 546 | `mvp-reserves.spec.ts` | @REC-007 — création réserve sur chantier |
| REC-008 | ✅ passed | 518 | `mvp-reserves.spec.ts` | @REC-008 — levée réserve conducteur CHT-003 |

---

## Artefacts

- Rapport HTML Playwright : `e2e/playwright-report-recette/index.html`
- Traces / captures : générées en cas d'échec (`e2e/test-results/`)

---

## Limites (validation MOA manuelle requise)

Les scénarios ci-dessus couvrent les **contrôles factuels** uniquement.  
La signature MOA reste obligatoire pour : libellés métier, confort UX, acceptation breaking change budget, décision GO/NO GO.

Voir : `docs/33-Cahier-Recette-MOA-Manuelle.md` · matrice : `docs/31-Matrice-Automatisation-Recette.md`

---

*Rapport recette automatisée — Chantiers360*
