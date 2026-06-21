# Matrice d'automatisation de la recette — Chantiers360

**Version :** 1.0  
**Date :** 21/06/2026  
**Périmètre :** MVP · EVOL-001 · EVOL-002 · EVOL-003  
**Références :** `docs/07-Cahier-Recette-Metier.md` · `docs/33-Cahier-Recette-MOA-Manuelle.md` · `docs/32-Framework-Recette-Automatisee.md`

---

## Synthèse

| Indicateur | Valeur |
|------------|--------|
| Scénarios REC actifs | 32 |
| Automatisables (**Oui**) | 23 |
| Partiellement automatisables | 9 |
| Manuel MOA uniquement | 0 |
| Couverture factuelle automatisée | **~77 %** (23 + 9×50 % / 32) |
| Couverture jugement MOA | **~23 %** |

---

## Légende

| Colonne | Signification |
|---------|---------------|
| **Automatisable** | Oui = contrôle factuel entièrement scripté · Partiel = complété par MOA · Non = jugement humain requis |
| **Type** | Playwright · API · manuel |
| **Test associé** | Fichier `e2e/tests/recette/*.spec.ts` ou — si manuel |

---

## MVP

| ID REC | Fonctionnalité | Description | Automatisable | Type | Fichier test | Justification si manuel |
|--------|----------------|-------------|---------------|------|--------------|-------------------------|
| REC-001 | Création chantier | Création avec statut Préparation | Oui | Playwright | `mvp-chantiers.spec.ts` | — |
| REC-002 | Modification chantier | Mise à jour client via API | Oui | API | `mvp-chantiers.spec.ts` | — |
| REC-003 | Changement statut | Avancement workflow +1 | Oui | API | `mvp-chantiers.spec.ts` | — |
| REC-004 | Retour arrière motif | RG-DATA-004 refus sans motif | Oui | API | `mvp-chantiers.spec.ts` | — |
| REC-005 | Affectation équipe | Ouverture modale affectation | Partiel | Playwright | `mvp-chantiers.spec.ts` | Pertinence liste utilisateurs, libellés fonction |
| REC-006 | Ajout avancement | Ouverture modale saisie | Partiel | Playwright | `mvp-chantiers.spec.ts` | Lisibilité timeline, confort saisie |
| REC-007 | Création réserve | Ouverture modale création | Partiel | Playwright | `mvp-reserves.spec.ts` | Clarté formulaire, priorités métier |
| REC-008 | Levée réserve | Validation levée conducteur | Partiel | Playwright | `mvp-reserves.spec.ts` | Cohérence parcours levée, messages confirmation |
| REC-009 | Photo legacy | Remplacé par EVOL-001 | — | — | — | Obsolète |
| REC-010 | Historique | Traçabilité actions seed CHT-001 | Oui | Playwright | `mvp-chantiers.spec.ts` | — |
| REC-011 | Dashboard conducteur | KPI visibles | Partiel | Playwright | `mvp-chantiers.spec.ts` | Cohérence données portefeuille Marc Dupont |
| REC-012 | Dashboard direction | Vue consolidée | Partiel | Playwright | `mvp-chantiers.spec.ts` | Lisibilité graphiques, drill-down métier |
| REC-013 | Refus clôture | Blocage si réserves ouvertes | Oui | API | `mvp-chantiers.spec.ts` | — |
| REC-014 | Contrôle rôles | Redirections par rôle | Oui | Playwright | `mvp-auth.spec.ts` | — |
| REC-015 | Connexion JWT | Login + session + `/auth/me` | Oui | Playwright + API | `mvp-auth.spec.ts` | — |

---

## EVOL-001 — Upload photos

| ID REC | Fonctionnalité | Description | Automatisable | Type | Fichier test | Justification si manuel |
|--------|----------------|-------------|---------------|------|--------------|-------------------------|
| REC-EVOL-001-01 | Upload JPG | Upload depuis fiche chantier | Oui | Playwright | `evol-001-photos.spec.ts` | — |
| REC-EVOL-001-02 | Taille max | Refus fichier > 10 Mo | Oui | API | `evol-001-photos.spec.ts` | — |
| REC-EVOL-001-03 | Suppression photo | Suppression + trace historique | Oui | Playwright + API | `evol-001-photos.spec.ts` | — |
| REC-EVOL-001-04 | Upload mobile chef | Accès vue mobile terrain | Partiel | Playwright | `evol-001-photos.spec.ts` | Confort usage mobile, qualité photo terrain |
| REC-EVOL-001-05 | Galerie globale | Page `/photos` | Oui | Playwright | `evol-001-photos.spec.ts` | — |

---

## EVOL-002 — Planning ouvriers

| ID REC | Fonctionnalité | Description | Automatisable | Type | Fichier test | Justification si manuel |
|--------|----------------|-------------|---------------|------|--------------|-------------------------|
| REC-EVOL-002-01 | Création créneau | Créneau sans conflit | Oui | Playwright | `evol-002-planning.spec.ts` | — |
| REC-EVOL-002-02 | Conflit planning | 409 + message explicite | Oui | Playwright | `evol-002-planning.spec.ts` | — |
| REC-EVOL-002-03 | Filtres | Filtres chantier + ouvrier | Oui | Playwright | `evol-002-planning.spec.ts` | — |
| REC-EVOL-002-04 | Vue mois/semaine | Navigation calendrier | Partiel | Playwright | `evol-002-planning.spec.ts` | Lisibilité calendrier mois, confort navigation |
| REC-EVOL-002-05 | KPI occupation | Indicateurs occupation | Partiel | Playwright | `evol-002-planning.spec.ts` | Pertinence chiffres occupation vs terrain |
| REC-EVOL-002-06 | Ouvrier désactivé | Absent des listes d'affectation | Oui | Playwright + API | `evol-002-planning.spec.ts` | — |
| REC-EVOL-002-07 | Périmètre RG-PLA-04 | Conducteur : ses chantiers seulement | Oui | Playwright | `evol-002-planning.spec.ts` | — |

---

## EVOL-003 — Budget & ressources

| ID REC | Fonctionnalité | Description | Automatisable | Type | Fichier test | Justification si manuel |
|--------|----------------|-------------|---------------|------|--------------|-------------------------|
| REC-EVOL-003-01 | Synthèse CHT-001 | 85 %+ consommation, alerte 80 % | Oui | Playwright + API | `evol-003-budget.spec.ts` | — |
| REC-EVOL-003-02 | Exclusion DRAFT | Brouillon/annulé exclus du consommé | Oui | API | `evol-003-budget.spec.ts` | — |
| REC-EVOL-003-03 | budgetSpent | Alignement liste chantiers / dépenses VALIDATED | Oui | API | `evol-003-budget.spec.ts` | — |
| REC-EVOL-003-04 | Chef lecture seule | Pas de boutons saisie budget | Oui | Playwright | `evol-003-budget.spec.ts` | — |
| REC-EVOL-003-05 | Dashboard direction | KPI budget > 80 % / > 100 % | Oui | Playwright | `evol-003-budget.spec.ts` | — |
| REC-EVOL-003-06 | Accès non référent | Message 403 explicite | Oui | Playwright | `evol-003-budget.spec.ts` | — |

**Note MOA :** l'acceptation du breaking change `budgetSpent` = dépenses VALIDATED (vs % avancement) est traitée dans `docs/33-Cahier-Recette-MOA-Manuelle.md` (MOA-BUD-01).

---

## Maintenance

À chaque nouvelle évolution :

1. Ajouter les lignes REC dans cette matrice.
2. Créer ou étendre un fichier `e2e/tests/recette/evol-NNN-*.spec.ts`.
3. Mettre à jour `docs/07-Cahier-Recette-Metier.md` et `docs/33-Cahier-Recette-MOA-Manuelle.md`.
4. Exécuter `npm run test:recette` et archiver le rapport généré.

---

*Matrice d'automatisation — Chantiers360*
