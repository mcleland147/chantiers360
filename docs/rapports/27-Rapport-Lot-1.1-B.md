# Rapport Lot 1.1-B — EVOL-002 Planning ouvriers

**Date :** 21/06/2026  
**Branche :** `evol/EVOL-002-planning-ouvriers`  
**Gate :** B — **GO ✅** (sous réserve validation MOA)

---

## 1. Périmètre livré

| Élément | Statut |
|---------|--------|
| Migration `0004_worker_planning` | ✅ |
| Entités `Worker`, `WorkerSchedule` | ✅ |
| `WorkersModule` + `PlanningModule` | ✅ |
| Page `/planning` + navigation | ✅ |
| Détection conflits HTTP 409 | ✅ |
| KPI occupation (35 h/semaine) | ✅ |
| Seed : 5 ouvriers, 10 créneaux / 2 semaines | ✅ |
| Tests TST-EVOL-002-01 à 08 | ✅ |
| Documentation | ✅ |

**Hors périmètre respecté :** EVOL-003, migrations 0005/0006, budget, Photo (aucune modification lot A).

---

## 2. Migrations

| Migration | Contenu |
|-----------|---------|
| `0004_worker_planning` | Tables `Worker`, `WorkerSchedule`, enum `ScheduleStatus`, index conflits |

---

## 3. Endpoints livrés

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

## 4. Tests exécutés

| Suite | Résultat |
|-------|----------|
| `npm run ci:test` | _voir section CI ci-dessous_ |
| TST-EVOL-002-01 | Chevauchement |
| TST-EVOL-002-02 | CANCELLED ignoré |
| TST-EVOL-002-03 | CRUD API planning |
| TST-EVOL-002-04 | HTTP 409 |
| TST-EVOL-002-05 | CRUD workers |
| TST-EVOL-002-06 | KPI occupation |
| TST-EVOL-002-07 | Filtres + calendrier RTL |
| TST-EVOL-002-08 | E2E planning |

---

## 5. Recette métier

| ID | Statut |
|----|--------|
| REC-EVOL-002-01 | ✅ |
| REC-EVOL-002-02 | ✅ |
| REC-EVOL-002-03 | ✅ |
| REC-EVOL-002-04 | ✅ |
| REC-EVOL-002-05 | ✅ |
| REC-EVOL-002-06 | ✅ |

---

## 6. CI / Build

_Résultats mis à jour après exécution locale._

| Commande | Statut |
|----------|--------|
| `npm run ci:test` | ✅ (84 FE + 46 BE unit + 37 API) |
| `npm run ci:build` | ✅ |
| `npm run ci:docker` | ✅ (après `down -v` volumes CI) |
| `npm run test:e2e -- tests/planning-affectation.spec.ts` | ✅ 4/4 |

---

## 7. Limites restantes

- Pas de sync Google Calendar / Outlook
- Tarifs horaire/journalier (`hourlyRate`, `dailyRate`) en base mais non exposés UI v1.1
- Grille custom simplifiée (pas FullCalendar)
- Portail ouvrier / login terrain : Release 2.0 (ADR-001)

---

## 8. Gate B — verdict

| Critère | Statut |
|---------|--------|
| ci:test | ✅ |
| ci:build | ✅ |
| ci:docker | ✅ |
| REC-EVOL-002-01 à 06 | ✅ |
| Rapport lot B | ✅ |

**Verdict Gate B : GO ✅** — lot 1.1-C (EVOL-003) autorisé sous validation MOA.

---

*Rapport Lot 1.1-B — Chantiers360 / BatiNova*
