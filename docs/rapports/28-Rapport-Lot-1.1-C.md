# Rapport Gate C — Lot 1.1-C (EVOL-003)

**Date :** 21/06/2026  
**Branche :** `evol/EVOL-003-budget-ressources`  
**Évolution :** EVOL-003 — Ressources chantier & Budget  
**Statut :** **Gate C — prêt pour PR / recette**

---

## 1. Périmètre livré

| Composant | Statut |
|-----------|--------|
| Migration `0005_budget_resources_expenses` | ✅ |
| Migration `0006_alert_budget_types` | ✅ |
| `BudgetModule` (9 endpoints) | ✅ |
| Refactor `budgetSpent` (VALIDATED only) | ✅ |
| Dashboard direction KPI budget réel | ✅ |
| Alertes `BUDGET_80` / `BUDGET_100` | ✅ |
| Onglet Budget fiche chantier | ✅ |
| Seed CHT-001 (3 ressources + 8 dépenses) | ✅ |

---

## 2. Breaking change documenté

**Champ `budgetSpent` (API chantiers + dashboard direction)**

| | MVP | Release 1.1-C |
|---|-----|---------------|
| Source | `% avancement × budget` | `SUM(ProjectExpense.amount) WHERE status = VALIDATED` |
| Impact | KPI direction simulés | KPI sur dépenses réelles saisies |

Communication MOA requise avant PROD.

---

## 3. Règles métier validées

| ID | Règle | Validation |
|----|-------|------------|
| RG-BUD-01 | Montant > 0 | DTO + API test |
| RG-BUD-02 | Alerte 80 % | Rules spec + E2E |
| RG-BUD-03 | Alerte 100 % | Rules spec |
| RG-BUD-04 | Restant = enveloppe − consommé | Rules spec |
| RG-BUD-05 | VALIDATED only | Rules spec + seed mix DRAFT/CANCELLED |

---

## 4. Tests exécutés

| Commande | Résultat |
|----------|----------|
| `npm run ci:test` | ✅ FE 92 + BE 58 + API 56 |
| `npm run ci:build` | ✅ |
| `npm run ci:docker` | ✅ |
| E2E `budget-expense-alert.spec.ts` | ✅ 3/3 |

### IDs cahier (TST-EVOL-003-01 à 07)

Tous **Passé** — voir `docs/06-Cahier-de-tests.md` §3.11.

---

## 5. Fichiers principaux

**Backend :** `backend/src/budget/*`, migrations 0005/0006, refactors `chantier-response.builder.ts`, `dashboard.helpers.ts`, `projects.service.ts`

**Frontend :** `frontend/src/components/budget/*`, `budgetService.ts`, `useBudget.ts`, onglet dans `ChantierDetailPage.tsx`

**E2E :** `e2e/helpers/mockBudgetApi.ts`, `e2e/tests/budget-expense-alert.spec.ts`

---

## 6. Gate C — verdict

| Critère | Statut |
|---------|--------|
| Périmètre EVOL-003 complet | ✅ |
| CI test/build/docker verts | ✅ |
| Breaking change documenté | ✅ |
| Hors scope V1.2/V2 respecté | ✅ |

**Recommandation :** merge après validation PR + recette MOA sur breaking budget.

---

*Rapport lot 1.1-C — Chantiers360 / BatiNova*
