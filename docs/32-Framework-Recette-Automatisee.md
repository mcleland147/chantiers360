# Framework de recette automatisée — Chantiers360

**Version :** 1.0  
**Date :** 21/06/2026  
**Statut :** Opérationnel (hors CI bloquante)

---

## 1. Objectif

Passer d'une **recette MOA 100 % manuelle** à une **recette MOA assistée** :

- **70 à 80 %** des scénarios REC couverts par des tests automatisés sur stack réelle ;
- **20 à 30 %** réservés à la validation humaine (jugement métier, UX, acceptation changement).

La signature MOA reste **obligatoire** pour la mise en production.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  npm run test:recette  (scripts/run-recette.sh)             │
├─────────────────────────────────────────────────────────────┤
│  1. PostgreSQL (docker compose) + prisma migrate + seed     │
│  2. Backend NestJS :3000 (démarrage si absent)              │
│  3. Frontend Vite :5173 (webServer Playwright)              │
│  4. Playwright e2e/tests/recette/*.spec.ts                  │
│  5. Rapport docs/rapports/recette-auto/recette-auto-*.md    │
└─────────────────────────────────────────────────────────────┘
```

| Composant | Emplacement | Rôle |
|-----------|-------------|------|
| Fixture recette | `e2e/fixtures.recette.ts` | Import Playwright **sans mocks** |
| Helpers API | `e2e/helpers/recetteApi.ts` | JWT, chantiers, budget, planning, upload |
| Tests recette | `e2e/tests/recette/` | Scénarios tagués `@REC-*` |
| Config Playwright | `e2e/playwright.recette.config.ts` | Reporter JSON + HTML dédié |
| Orchestration | `scripts/run-recette.sh` | Stack complète |
| Rapport | `scripts/generate-recette-report.mjs` | Markdown daté |

---

## 3. Différence E2E mockés vs recette automatisée

| Critère | E2E classiques (`e2e/tests/*.spec.ts`) | Recette automatisée (`e2e/tests/recette/`) |
|---------|----------------------------------------|--------------------------------------------|
| API | Mockée (`e2e/fixtures.ts`) | **Réelle** `localhost:3000/api` |
| Base de données | Données fictives en mémoire | **PostgreSQL seedé** (`prisma:seed`) |
| Authentification | Session simulée | **JWT réel** (`POST /auth/login`) |
| Vitesse | Rapide (~secondes) | Plus lent (~minutes) |
| Objectif | Régression dev / CI | **Recette factuelle pré-MOA** |
| CI | Intégré (`test:e2e`) | **Non bloquant** (volontaire) |

Les deux dispositifs sont **complémentaires** : les E2E mockés protègent le quotidien ; la recette automatisée valide le comportement réel avant signature MOA.

---

## 4. Commande

```bash
# Depuis la racine du dépôt
npm run test:recette
```

**Prérequis :** Docker (PostgreSQL), Node.js, dépendances installées (`npm install` racine + frontend + backend + e2e).

**Comptes seed :** `conducteur@batinova.fr` / `demo123` (voir `docs/API.md`).

**Variables optionnelles :**

| Variable | Défaut |
|----------|--------|
| `RECETTE_API_URL` | `http://localhost:3000/api` |
| `RECETTE_BASE_URL` | `http://localhost:5173` |

---

## 5. Génération du rapport

Après exécution Playwright :

- **JSON :** `e2e/recette-results.json`
- **HTML :** `e2e/playwright-report-recette/index.html`
- **Markdown :** `docs/rapports/recette-auto/recette-auto-YYYY-MM-DD.md`

Le rapport contient : synthèse pass/fail, mapping REC ↔ test, artefacts (traces, captures en cas d'échec), limites de l'automatisation.

---

## 6. Rôle de la MOA

La MOA intervient sur les scénarios **non automatisables** ou **partiels** (`docs/33-Cahier-Recette-MOA-Manuelle.md`) :

- Compréhension des écrans et libellés métier ;
- Clarté des messages d'erreur ;
- Confort du parcours utilisateur ;
- Cohérence des workflows ;
- Acceptation breaking change budget ;
- Lisibilité dashboards et planning ;
- Usage terrain mobile ;
- **Décision GO / NO GO**.

Le rapport automatisé **ne remplace pas** la signature MOA.

---

## 7. Limites de l'automatisation

| Limite | Raison |
|--------|--------|
| Jugements subjectifs | Non scriptables (pertinence KPI, ergonomie) |
| Acceptation changement métier | Décision humaine (budget simulé → réel) |
| Usage mobile terrain | Conditions réelles (luminosité, réseau, gestes) |
| Libellés et ton des messages | Validation linguistique MOA |
| Données sensibles PROD | Recette sur seed REC uniquement |

---

## 8. Ajouter une recette pour une future évolution

1. **Qualifier** chaque scénario REC : Oui / Partiel / Non (`docs/31-Matrice-Automatisation-Recette.md`).
2. **Créer** `e2e/tests/recette/evol-NNN-<slug>.spec.ts` avec tags `@REC-EVOL-NNN-XX` dans les titres de test.
3. **Réutiliser** `e2e/fixtures.recette.ts` et `e2e/helpers/recetteApi.ts` (étendre si besoin).
4. **Mettre à jour** `docs/07-Cahier-Recette-Metier.md` (colonnes automatisation).
5. **Compléter** `docs/33-Cahier-Recette-MOA-Manuelle.md` pour les scénarios manuels.
6. **Exécuter** `npm run test:recette` et archiver le rapport.
7. **Utiliser** `docs/34-Template-Recette-MOA-Manuelle-Evolution.md` pour la fiche évolution.

---

## 9. Convention de nommage des tests

```typescript
test("@REC-EVOL-003-01 — synthèse CHT-001 seed (API + UI)", async ({ page }) => {
  // ...
});
```

Le tag `@REC-*` est extrait par `generate-recette-report.mjs` pour le mapping rapport.

---

*Framework recette automatisée — Chantiers360*
