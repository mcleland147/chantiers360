# Template — Recette MOA manuelle par évolution

**Usage :** dupliquer ce fichier pour chaque `EVOL-NNN` livrée.  
**Exemple :** `evolutions/EVOL-004-recette-moa.md`

---

## En-tête

| Champ | Valeur |
|-------|--------|
| **ID évolution** | EVOL-NNN |
| **Titre** | |
| **Release** | ex. 1.2-A |
| **Date** | |
| **Responsable dev** | |
| **Validateur MOA** | |

---

## Périmètre

### In scope

- 

### Out of scope

- 

---

## Scénarios automatisés couverts

Exécutés via `npm run test:recette` — fichier `e2e/tests/recette/evol-NNN-*.spec.ts`

| ID REC | Description | Fichier test | Statut auto |
|--------|-------------|--------------|-------------|
| REC-EVOL-NNN-01 | | | ☐ Passé |
| REC-EVOL-NNN-02 | | | ☐ Passé |

**Rapport :** `docs/rapports/recette-auto/recette-auto-YYYY-MM-DD.md`

---

## Scénarios manuels restants

| ID MOA | REC lié | Objectif métier | Automatisé | À valider MOA |
|--------|---------|-----------------|------------|---------------|
| MOA-… | REC-… | | Partiel / Non | Oui |

### Détail scénario manuel (répéter par scénario)

| Champ | Valeur |
|-------|--------|
| **ID** | MOA-… |
| **Objectif métier** | |
| **Prérequis** | |
| **Étapes MOA** | 1. … 2. … |
| **Résultat attendu** | |
| **Décision** | ☐ OK ☐ KO ☐ Réserve |
| **Commentaire MOA** | |
| **Signature / date** | |

---

## Points d'attention métier

- [ ] Impact règles RG existantes
- [ ] Impact rôles / permissions
- [ ] Breaking change documenté et accepté MOA
- [ ] Données seed REC à jour
- [ ] Matrice `docs/31-Matrice-Automatisation-Recette.md` mise à jour
- [ ] `docs/07-Cahier-Recette-Metier.md` mis à jour
- [ ] `docs/33-Cahier-Recette-MOA-Manuelle.md` complété si nouveaux scénarios manuels

---

## Critères de signature MOA

| # | Critère | OK |
|---|---------|-----|
| 1 | Tous les tests recette auto passent (ou écarts justifiés) | ☐ |
| 2 | Scénarios manuels exécutés sans KO bloquant | ☐ |
| 3 | Libellés et parcours validés par le métier | ☐ |
| 4 | Breaking changes acceptés (si applicable) | ☐ |
| 5 | Documentation utilisateur à jour (si applicable) | ☐ |

---

## Décision GO / NO GO

| Champ | Valeur |
|-------|--------|
| **Décision** | ☐ GO ☐ NO GO |
| **Date** | |
| **Signataire MOA** | |
| **Commentaire** | |
| **Réserve / conditions** | |

---

*Template recette MOA — Chantiers360*
