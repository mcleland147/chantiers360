# Rapport Lot 1.1-B — EVOL-002 Planning ouvriers

**Date :** 21/06/2026  
**Branche :** `evol/EVOL-002-planning-ouvriers`  
**Gate :** B — **GO ✅** (sous réserve validation MOA)

---

## 1. Périmètre livré

| Élément | Statut |
|---------|--------|
| Migration `0004_worker_planning` | ✅ |
| Entités `Worker`, `WorkerSchedule`, `ScheduleStatus` | ✅ |
| `WorkersModule` + `PlanningModule` | ✅ |
| Page `/planning` + navigation | ✅ |
| Filtres chantier / ouvrier | ✅ |
| KPI occupation (35 h/semaine) | ✅ |
| Modale CRUD conducteur | ✅ |
| Règles conflit RG-PLA-01 / RG-PLA-02 | ✅ |
| Règle périmètre RG-PLA-04 (UI + API) | ✅ |
| Historisation planning sur chantier | ✅ |
| Seed : 5 ouvriers, 10 créneaux / 2 semaines | ✅ |
| Tests TST-EVOL-002-01 à 09 | ✅ |
| E2E planning : 5 scénarios | ✅ |
| Documentation Gate B | ✅ |

**Hors périmètre respecté :** EVOL-003, migrations 0005/0006, `ProjectResource`, `ProjectExpense`, `ExpenseStatus`, budget, logique `budgetSpent`.

---

## 2. Correctifs post-recette manuelle

| # | Problème | Correctif | Commit |
|---|----------|-----------|--------|
| 1 | `GET /api/planning` → 400 (ValidationPipe) | Import **value** (non `type`) des DTO dans les controllers planning/workers | `061d02f` |
| 2 | Bouton « Enregistrer » invisible | Classes `bg-primary` → `bg-brand` / `text-brand` (token Tailwind manquant) | `1638052` |
| 3 | Filtre/modale proposaient des chantiers non autorisés | **RG-PLA-04** — `filterChantiersForPlanningScope` + `usePlanningChantiersQuery` | `1638052` + finalisation Gate B |

---

## 3. Règle RG-PLA-04

| Rôle | Lecture | Écriture | UI (filtre + modale) |
|------|---------|----------|----------------------|
| Conducteur | Ses chantiers (`conductorId`) | Ses chantiers uniquement — sinon **403** | Même périmètre |
| Chef de chantier | Chantiers affectés | Interdit | Chantiers affectés |
| Direction / Assistante | Tous | Interdit | Tous (consultation) |

**Implémentation :**

- Backend : `PlanningService.buildProjectScopeForRole`, `assertCanWriteProject`
- Frontend : `planningChantiers.ts`, `usePlanningChantiersQuery`, reset filtre via `isProjectInPlanningScope`

---

## 4. Migrations Release 1.1

| Migration | Contenu |
|-----------|---------|
| `0003_photo_upload_storage` | Lot 1.1-A (photos) |
| `0004_worker_planning` | Lot 1.1-B — `Worker`, `WorkerSchedule`, `ScheduleStatus` |

**Aucune migration 0005 / 0006** — EVOL-003 non démarré.

---

## 5. Endpoints livrés

| Méthode | Route |
|---------|-------|
| GET | `/api/workers` |
| POST | `/api/workers` |
| PATCH | `/api/workers/:id` |
| GET | `/api/planning` |
| POST | `/api/planning/slots` |
| PUT | `/api/planning/slots/:id` |
| DELETE | `/api/planning/slots/:id` |
| GET | `/api/planning/conflicts` |
| GET | `/api/planning/kpi/occupation` |

---

## 6. Tests exécutés

| ID | Type | Fichier | Objet |
|----|------|---------|-------|
| TST-EVOL-002-01 | Unit BE | `planning-conflicts.rules.spec.ts` | Chevauchement |
| TST-EVOL-002-02 | Unit BE | idem | CANCELLED ignoré |
| TST-EVOL-002-03 | API | `planning.api.spec.ts` | CRUD planning |
| TST-EVOL-002-04 | API | idem | HTTP 409 |
| TST-EVOL-002-05 | API | `workers.api.spec.ts` | CRUD workers |
| TST-EVOL-002-06 | Unit + API | rules + `planning.api.spec.ts` | KPI occupation |
| TST-EVOL-002-07 | RTL | `PlanningFilters.test.tsx`, `PlanningCalendar.test.tsx` | Filtres + calendrier |
| TST-EVOL-002-08 | E2E | `planning-affectation.spec.ts` | Parcours E2E-01 à 04 |
| TST-EVOL-002-09 | Unit FE + BE + E2E | `planningChantiers.test.ts`, `planning.service.spec.ts`, E2E-05 | RG-PLA-04 |

---

## 7. Recette métier

| ID | Statut |
|----|--------|
| REC-EVOL-002-01 | ✅ |
| REC-EVOL-002-02 | ✅ |
| REC-EVOL-002-03 | ✅ |
| REC-EVOL-002-04 | ✅ |
| REC-EVOL-002-05 | ✅ |
| REC-EVOL-002-06 | ✅ |
| REC-EVOL-002-07 — RG-PLA-04 | ✅ |

---

## 8. CI / Build

| Commande | Statut |
|----------|--------|
| `npm run ci:test` | ✅ 89 FE + 51 BE unit + 37 API = **177 tests** |
| `npm run ci:build` | ✅ |
| `npm run ci:docker` | ✅ (après `docker compose … down -v` volumes CI) |
| `npm run test:e2e -- tests/planning-affectation.spec.ts` | ✅ **5/5** |

---

## 9. Limites restantes

- Pas de sync Google Calendar / Outlook
- Tarifs horaire/journalier en base, non exposés UI v1.1
- Grille calendrier simplifiée (pas FullCalendar)
- Portail ouvrier / login terrain : Release 2.0 (ADR-001)

---

## 10. Gate B — verdict

| Critère | Statut |
|---------|--------|
| ci:test | ✅ 177 tests |
| ci:build | ✅ |
| ci:docker | ✅ |
| REC-EVOL-002-01 à 07 | ✅ |
| Correctifs DTO + UI + RG-PLA-04 | ✅ |
| EVOL-003 non démarré | ✅ |
| Migrations 0003 + 0004 uniquement | ✅ |

**Verdict Gate B : GO ✅**

**Recommandation :** ouverture lot 1.1-C (EVOL-003 budget & ressources) **uniquement après validation MOA explicite** — ne pas démarrer sans accord.

**PR :** `gh pr create --base main --head evol/EVOL-002-planning-ouvriers`

---

*Rapport Lot 1.1-B — Chantiers360 / BatiNova — Gate B finalisé*
