# EVOL-003 — Ressources chantier & Budget

**Processus :** `docs/23-Processus-Gestion-Evolutions.md`  
**Release :** 1.1.0 · **Lot :** 1.1-C  
**Références techniques :** `docs/24-Release-1.1-Backlog.md` §C · `docs/22-Release-1.1-DataModel.md`

---

## En-tête

| Champ | Valeur |
|-------|--------|
| **ID** | EVOL-003 |
| **Titre** | Ressources chantier & Budget |
| **Type** | F — Fonctionnelle |
| **Priorité** | P1 |
| **Statut** | **Gate C — prêt PR** |
| **Demandeur** | Direction BTP / Conducteur de travaux |
| **Date demande** | 15/06/2026 |
| **Version cible** | v1.1.0 |
| **Auteur fiche** | Équipe BatiNova |
| **Lot développement** | 1.1-C |

---

## 1. Demande client

### 1.1 Contexte

Le MVP affiche un **budget enveloppe** (`Project.budget`) et un **budget consommé simulé** calculé à partir du **pourcentage d'avancement** — pas de suivi des dépenses réelles. La direction ne peut pas piloter finement la marge chantier ni être alertée avant dépassement.

### 1.2 Besoin exprimé

> « Gérer les ressources prévues et les dépenses réelles par chantier, voir le budget consommé et restant, recevoir des alertes à 80 % et 100 %, et avoir des KPI financiers consolidés au dashboard direction. »

### 1.3 Bénéfice attendu

- Pilotage financier chantier fiable
- Anticipation des dépassements (alertes 80/100 %)
- Remplacement du budget simulé par des données saisies
- Visibilité direction sur chantiers à risque financier

### 1.4 Échéance souhaitée

Release **1.1.0** — lot C (dernier lot — tag v1.1.0).

---

## 2. Qualification

### 2.1 Périmètre IN

- CRUD **ressources** chantier (`ProjectResource`) — type, libellé, coût, quantité
- CRUD **dépenses** (`ProjectExpense`) — catégorie, montant, date, fournisseur, référence facture, statut
- Enum **ExpenseStatus** : `DRAFT`, `VALIDATED`, `CANCELLED` — défaut `VALIDATED` à la création UI v1.1
- Champs modèle `attachmentUrl` (upload facture reporté V1.2/V2)
- **Synthèse budget** : enveloppe, consommé (Σ dépenses), restant, % consommation
- **Alertes** automatiques `BUDGET_80` et `BUDGET_100` (type `Alert`)
- Onglet **Budget** sur fiche chantier
- Refactor **dashboard direction** — KPI budget sur dépenses **VALIDATED**
- Refactor **`budgetSpent`** API chantiers = somme dépenses **VALIDATED**
- Barre progression colorée (vert / orange / rouge)
- Historisation saisie dépense significative (optionnelle > seuil)

### 2.2 Périmètre OUT

- Intégration ERP / comptabilité (Sage, Cegid…)
- Multi-devises
- Workflow validation dépense complet (DRAFT → VALIDATED → CANCELLED) — **partiel v1.1** : création directe VALIDATED
- Upload pièce jointe facture / bon de livraison (`attachmentUrl` en modèle, non exploité v1.1)
- Export comptable
- Factures OCR / scan

### 2.3 Utilisateurs impactés

| Rôle | Impact |
|------|--------|
| Direction | Lecture synthèse + KPI dashboard + alertes |
| Assistante administrative | CRUD ressources et dépenses |
| Conducteur de travaux | CRUD ressources et dépenses |
| Chef de chantier | Lecture budget chantier affecté |

### 2.4 Critères d'acceptation

1. **Étant donné** un chantier avec enveloppe 100 000 € et dépenses VALIDATED 85 000 €, **alors** synthèse affiche 85 % et alerte `BUDGET_80` active.
2. **Étant donné** dépenses VALIDATED ≥ enveloppe, **alors** alerte `BUDGET_100` + badge dépassement fiche.
3. **Étant donné** une dépense VALIDATED saisie, **alors** dashboard direction `totalSpent` mis à jour.
4. **Étant donné** une dépense DRAFT ou CANCELLED, **alors** elle n'impacte ni consommé, ni alertes, ni dashboard.
5. **Étant donné** un chef sur chantier affecté, **alors** lecture seule onglet Budget.
6. **Étant donné** enveloppe non définie, **alors** message informatif sans erreur technique.

### 2.5 Dépendances

| Dépendance | Statut |
|------------|--------|
| Lot 1.1-B validé (gate) | Bloquante séquence |
| `Project.budget` existant | ✅ |
| Module Alert MVP | ✅ — extension enum |
| Communication client breaking budget | Bloquante PROD |

---

## 3. Analyse d'impact

| Domaine | Impact | Détail |
|---------|--------|--------|
| Règles métier | Majeur | RG-BUD-01 à **05** — calculs VALIDATED only, alertes |
| Rôles / permissions | Modéré | Écriture Conducteur/Assistante |
| API REST | Majeur | ~9 endpoints BudgetModule |
| Base de données | Migration | `0005_budget`, `0006_alert_types` |
| Frontend | Majeur | Onglet Budget + refactor widgets |
| Performance | Faible | Agrégations SUM indexées |
| Sécurité | Faible | Montants — pas de PCI |
| Exploitation | Faible | Pas de volume fichiers |

### 3.1 Documents à mettre à jour

- [x] Conception — impact analysis, data model
- [ ] `docs/06-Cahier-de-tests.md` — TST-R11-C-*
- [ ] `docs/07-Cahier-Recette-Metier.md` — REC-EVOL-003-*
- [ ] `docs/25-Changelog.md` — **Changed** breaking budget
- [ ] `docs/API.md`
- [ ] `docs/09-Guide-Utilisateur.md`
- [ ] Note release client — changement dashboard
- [ ] `docs/08-DAT-v1.md`

### 3.2 Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| **Breaking** budget dashboard | Élevée | Élevé | Note release + email MOA avant PROD |
| Incohérence KPI direction | Moyenne | Élevé | Tests agrégation VALIDATED + recette croisée |
| **Dépenses non validées dans KPI** | Moyenne | Élevé | Agrégats uniquement sur `ExpenseStatus.VALIDATED` |
| **Pièces jointes facture non gérées v1.1** | Élevée | Faible | `attachmentUrl` en modèle ; upload V1.2/V2 |
| Alertes dupliquées | Faible | Moyen | Idempotence création alerte par seuil |
| Saisie erronée dépenses | Moyenne | Moyen | Confirmation montants élevés (V2) |

---

## 4. Chiffrage

| Poste | j/h bas | j/h médian | j/h haut |
|-------|---------|------------|----------|
| Développement | 7 | 9 | 12 |
| Tests | 2 | 2 | 3 |
| Recette & documentation | 1 | 1,5 | 2 |
| Déploiement + comm client | 0,5 | 1 | 1,5 |
| Marge risque (+15 %) | 1,5 | 2 | 2,5 |
| **Total** | **12** | **12** | **16** |

**Hypothèses :** une devise EUR ; alertes via table Alert existante.  
**Exclusions :** ERP, validation workflow.

---

## 5. Validation

| Validateur | Rôle | Date | Accord |
|------------|------|------|--------|
| Comité évolutions | Arbitrage | 21/06/2026 | ✅ Validée — v1.1.0 |
| MOA client | Métier + breaking budget | _À compléter_ | ☐ |

---

## 6. Développement

| Élément | Valeur |
|---------|--------|
| Branche Git | `evol/EVOL-003-budget-ressources` |
| Migration Prisma | Oui — `0005_budget_resources_expenses`, `0006_alert_budget_types` |

---

## 7. Tests

### 7.1 Tests automatisés prévus

| ID | Type | Fichier | Description |
|----|------|---------|-------------|
| TST-EVOL-003-01 | Unit | `budget-summary.spec.ts` | Calcul restant — VALIDATED only |
| TST-EVOL-003-02 | Unit | idem | DRAFT/CANCELLED exclus ; alertes 80/100 % |
| TST-EVOL-003-03 | API | `budget.api.spec.ts` | CRUD expense |
| TST-EVOL-003-04 | API | idem | Summary endpoint |
| TST-EVOL-003-05 | API | `dashboard.e2e-spec.ts` | Budget direction réel |
| TST-EVOL-003-06 | RTL | `BudgetSummaryCard.test.tsx` | Barre couleurs |
| TST-EVOL-003-07 | E2E | `budget-expense-alert.spec.ts` | Parcours alerte |

### 7.2 Exécution

_À compléter en développement._

---

## 8. Recette métier

### 8.1 Scénarios

| ID | Objectif | Statut | Exécutant | Date |
|----|----------|--------|-----------|------|
| REC-EVOL-003-01 | Saisir ressource + dépense | ☐ | Assistante | |
| REC-EVOL-003-02 | Synthèse % et restant corrects | ☐ | Conducteur | |
| REC-EVOL-003-03 | Alerte 80 % déclenchée | ☐ | Conducteur | |
| REC-EVOL-003-04 | Alerte 100 % + badge | ☐ | Direction | |
| REC-EVOL-003-05 | Dashboard direction cohérent | ☐ | Direction | |
| REC-EVOL-003-06 | Chef lecture seule | ☐ | Chef | |

### 8.2 Signature recette

| Validateur métier | Date | Signature |
|-------------------|------|-----------|
| _Nom_ | _—_ | ☐ Recette acceptée |

---

## 9. Déploiement & rollback

### 9.1 Déploiement

**Communication obligatoire avant PROD :** changement sémantique `budgetSpent` (simulé → réel).

| Environnement | Date | Version | Résultat |
|---------------|------|---------|----------|
| REC | _—_ | v1.1.0-rc.C | ☐ |
| PROD | _—_ | **v1.1.0** | ☐ |

### 9.2 Procédure de rollback

```bash
npm run ops:backup
# Si migrations 0005/0006 appliquées :
OPS_FORCE=1 npm run ops:restore -- backup/chantiers360_<pré-deploy>.sql.gz
git checkout v1.0.0   # ou tag pré-1.1-C
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
npm run ops:health
```

**Alternative hotfix :** réactiver calcul `% avancement` via feature flag si restore impossible (documenter en runbook).

**Durée estimée rollback :** 20–30 min (restore BDD).

---

## 10. Clôture — Definition of Done

```
[ ] D1–D8 — tag v1.1.0 poussé après ce lot
```

**Statut final :** Conception GO — en attente développement lot 1.1-C (après gate B)

---

*EVOL-003 — Ressources chantier & Budget — Chantiers360 / BatiNova*
