# Cahier de recette MOA manuelle — Chantiers360

**Version :** 1.0  
**Date :** 21/06/2026  
**Public :** MOA client, validateur métier  
**Complément :** `docs/31-Matrice-Automatisation-Recette.md` · `npm run test:recette`

Ce cahier ne contient que les scénarios **non automatisables** ou **partiellement automatisables** nécessitant un jugement humain. Les contrôles factuels sont exécutés par la recette automatisée.

**Environnement :** seed recette, `http://localhost:5173`, API `http://localhost:3000/api`, mot de passe `demo123`.

---

## Légende décision

| Code | Signification |
|------|---------------|
| **OK** | Critère métier validé |
| **KO** | Bloquant — correction requise |
| **Réserve** | Accepté avec réserve documentée |

---

## MVP — Parcours et UX

### MOA-MVP-05 — REC-005 Affectation équipe (complément)

| Champ | Valeur |
|-------|--------|
| **ID** | MOA-MVP-05 |
| **REC lié** | REC-005 |
| **Fonctionnalité** | Affectation membre équipe |
| **Objectif métier** | Vérifier que l'affectation est compréhensible et traçable |
| **Prérequis** | Connecté `conducteur@batinova.fr`, fiche CHT-005, onglet Équipe |
| **Étapes MOA** | 1. Cliquer « Affecter un membre » 2. Choisir un chef et une fonction 3. Valider 4. Vérifier la liste et l'historique |
| **Résultat attendu** | Membre visible avec fonction claire ; entrée historique « Affectation équipe » lisible |
| **Automatisé (partiel)** | Ouverture modale uniquement |
| **Décision** | ☐ OK ☐ KO ☐ Réserve |
| **Commentaire MOA** | |
| **Signature / date** | |

---

### MOA-MVP-06 — REC-006 Ajout avancement (complément)

| Champ | Valeur |
|-------|--------|
| **ID** | MOA-MVP-06 |
| **REC lié** | REC-006 |
| **Fonctionnalité** | Saisie avancement |
| **Objectif métier** | Le conducteur saisit un avancement de façon fluide |
| **Prérequis** | Connecté conducteur, CHT-001, onglet Avancement |
| **Étapes MOA** | 1. « Ajouter une mise à jour » 2. Saisir commentaire et % 3. Valider 4. Relire la timeline |
| **Résultat attendu** | Entrée chronologique lisible, % cohérent, auteur identifiable |
| **Automatisé (partiel)** | Ouverture modale uniquement |
| **Décision** | ☐ OK ☐ KO ☐ Réserve |
| **Commentaire MOA** | |
| **Signature / date** | |

---

### MOA-MVP-07 — REC-007 Création réserve (complément)

| Champ | Valeur |
|-------|--------|
| **ID** | MOA-MVP-07 |
| **REC lié** | REC-007 |
| **Fonctionnalité** | Création réserve |
| **Objectif métier** | Formulaire réserve adapté au terrain |
| **Prérequis** | Connecté conducteur, CHT-001, onglet Réserves |
| **Étapes MOA** | 1. « Créer une réserve » 2. Remplir titre, priorité, description 3. Valider |
| **Résultat attendu** | Réserve « Ouverte » ; libellés priorité compréhensibles |
| **Automatisé (partiel)** | Ouverture modale uniquement |
| **Décision** | ☐ OK ☐ KO ☐ Réserve |
| **Commentaire MOA** | |
| **Signature / date** | |

---

### MOA-MVP-08 — REC-008 Levée réserve (complément)

| Champ | Valeur |
|-------|--------|
| **ID** | MOA-MVP-08 |
| **REC lié** | REC-008 |
| **Fonctionnalité** | Levée réserve |
| **Objectif métier** | Parcours de levée clair pour le conducteur |
| **Prérequis** | CHT-003, réserve en cours, connecté conducteur |
| **Étapes MOA** | 1. Onglet Réserves 2. « Valider levée » 3. Confirmer 4. Vérifier statut et historique |
| **Résultat attendu** | Statut « Levée » ; message de confirmation explicite |
| **Automatisé (partiel)** | Tentative conditionnelle automatisée |
| **Décision** | ☐ OK ☐ KO ☐ Réserve |
| **Commentaire MOA** | |
| **Signature / date** | |

---

### MOA-MVP-11 — REC-011 Dashboard conducteur (complément)

| Champ | Valeur |
|-------|--------|
| **ID** | MOA-MVP-11 |
| **REC lié** | REC-011 |
| **Fonctionnalité** | Dashboard conducteur |
| **Objectif métier** | KPI reflètent le portefeuille réel de Marc Dupont |
| **Prérequis** | Connecté `conducteur@batinova.fr` |
| **Étapes MOA** | 1. `/dashboard` 2. Comparer KPI avec chantiers connus (CHT-001, 003, 005…) 3. Lire alertes et listes |
| **Résultat attendu** | Chiffres cohérents avec la réalité métier du conducteur |
| **Automatisé (partiel)** | Présence KPI uniquement |
| **Décision** | ☐ OK ☐ KO ☐ Réserve |
| **Commentaire MOA** | |
| **Signature / date** | |

---

### MOA-MVP-12 — REC-012 Dashboard direction (complément)

| Champ | Valeur |
|-------|--------|
| **ID** | MOA-MVP-12 |
| **REC lié** | REC-012 |
| **Fonctionnalité** | Dashboard direction |
| **Objectif métier** | Vue consolidée lisible pour pilotage entreprise |
| **Prérequis** | Connecté `direction@batinova.fr` |
| **Étapes MOA** | 1. `/dashboard/direction` 2. Analyser KPI, graphiques, chantiers à risque 3. Drill-down CHT-003 |
| **Résultat attendu** | 20 chantiers seedés visibles ; graphiques compréhensibles ; pas d'action de modification |
| **Automatisé (partiel)** | Présence graphique budget |
| **Décision** | ☐ OK ☐ KO ☐ Réserve |
| **Commentaire MOA** | |
| **Signature / date** | |

---

## EVOL-001 — Photos

### MOA-PHO-03 — REC-EVOL-001-03 Suppression photo

> **Couvert par recette automatisée** — `evol-001-photos.spec.ts` @REC-EVOL-001-03 (DELETE API + historique « Suppression photo »). Validation MOA optionnelle en relecture du rapport.

---

### MOA-PHO-04 — REC-EVOL-001-04 Usage mobile chef

| Champ | Valeur |
|-------|--------|
| **ID** | MOA-PHO-04 |
| **REC lié** | REC-EVOL-001-04 |
| **Fonctionnalité** | Upload terrain mobile |
| **Objectif métier** | Le chef peut photographier sur chantier sans friction |
| **Prérequis** | Connecté `chef@batinova.fr`, smartphone ou vue étroite |
| **Étapes MOA** | 1. `/mobile` 2. Sélectionner chantier 3. Photo → prendre/charger image 4. Envoyer |
| **Résultat attendu** | Upload réussi ; boutons accessibles au pouce ; message succès clair |
| **Automatisé (partiel)** | Accès page et bouton Photo |
| **Décision** | ☐ OK ☐ KO ☐ Réserve |
| **Commentaire MOA** | |
| **Signature / date** | |

---

## EVOL-002 — Planning

### MOA-PLA-04 — REC-EVOL-002-04 Navigation calendrier

| Champ | Valeur |
|-------|--------|
| **ID** | MOA-PLA-04 |
| **REC lié** | REC-EVOL-002-04 |
| **Fonctionnalité** | Vue semaine / mois |
| **Objectif métier** | Le planning est lisible pour anticiper les affectations |
| **Prérequis** | Connecté conducteur ou direction, `/planning` |
| **Étapes MOA** | 1. Basculer Semaine / Mois 2. Naviguer périodes 3. Identifier créneaux seedés |
| **Résultat attendu** | Calendrier lisible ; couleurs et libellés chantier compréhensibles |
| **Décision** | ☐ OK ☐ KO ☐ Réserve |
| **Commentaire MOA** | |
| **Signature / date** | |

---

### MOA-PLA-05 — REC-EVOL-002-05 Pertinence KPI occupation

| Champ | Valeur |
|-------|--------|
| **ID** | MOA-PLA-05 |
| **REC lié** | REC-EVOL-002-05 |
| **Fonctionnalité** | KPI occupation équipes |
| **Objectif métier** | Les indicateurs aident à répartir les ouvriers |
| **Prérequis** | Connecté direction, `/planning` |
| **Étapes MOA** | 1. Lire bloc « Occupation équipes » 2. Comparer avec créneaux visibles 3. Évaluer utilité pilotage |
| **Résultat attendu** | Chiffres plausibles et exploitables pour la direction |
| **Automatisé (partiel)** | Présence bloc KPI |
| **Décision** | ☐ OK ☐ KO ☐ Réserve |
| **Commentaire MOA** | |
| **Signature / date** | |

---

### MOA-PLA-06 — REC-EVOL-002-06 Ouvrier désactivé

> **Couvert par recette automatisée** — `evol-002-planning.spec.ts` @REC-EVOL-002-06 (w-5 seed inactif, PATCH désactivation, listes UI). Validation MOA optionnelle en relecture du rapport.

---

## EVOL-003 — Budget

### MOA-BUD-01 — Acceptation breaking change budgetSpent

| Champ | Valeur |
|-------|--------|
| **ID** | MOA-BUD-01 |
| **REC lié** | REC-EVOL-003-03 (complément MOA) |
| **Fonctionnalité** | Définition budget consommé |
| **Objectif métier** | Valider le passage budget simulé (% avancement) → budget réel (dépenses VALIDATED) |
| **Prérequis** | Rapport recette auto passé ; dashboard direction accessible |
| **Étapes MOA** | 1. Comparer `budgetSpent` CHT-001 avec onglet Budget 2. Vérifier dashboard direction 3. Arbitrer avec direction financière |
| **Résultat attendu** | MOA accepte la nouvelle définition et ses impacts reporting |
| **Automatisé (partiel)** | Égalité API automatisée |
| **Décision** | ☐ OK ☐ KO ☐ Réserve |
| **Commentaire MOA** | |
| **Signature / date** | |

---

## Transversal — Validation globale

### MOA-GLOBAL-01 — Compréhension écrans et libellés

| Champ | Valeur |
|-------|--------|
| **ID** | MOA-GLOBAL-01 |
| **Fonctionnalité** | UX transverse |
| **Objectif métier** | Terminologie Chantier / Réserve / Réalisation cohérente |
| **Prérequis** | Parcours MVP + 3 EVOL sur comptes seed |
| **Étapes MOA** | 1. Parcourir menus principaux 2. Noter libellés ambigus 3. Vérifier messages d'erreur rencontrés |
| **Résultat attendu** | Vocabulaire aligné métier BTP / usage interne |
| **Décision** | ☐ OK ☐ KO ☐ Réserve |
| **Commentaire MOA** | |
| **Signature / date** | |

---

### MOA-GLOBAL-02 — Décision GO / NO GO mise en production

| Champ | Valeur |
|-------|--------|
| **ID** | MOA-GLOBAL-02 |
| **Fonctionnalité** | Gate recette globale |
| **Objectif métier** | Décision formelle de mise en production |
| **Prérequis** | Rapport `docs/rapports/recette-auto/recette-auto-*.md` + ce cahier complété |
| **Étapes MOA** | 1. Lire synthèse recette auto 2. Revoir KO / Réserves 3. Signer GO ou NO GO |
| **Résultat attendu** | Décision documentée avec date et signataire |
| **Décision** | ☐ GO ☐ NO GO |
| **Commentaire MOA** | |
| **Signature / date** | |

---

*Cahier recette MOA manuelle — Chantiers360*
