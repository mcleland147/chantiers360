# Cahier de recette métier — Chantiers360 MVP

Environnement : seed recette (`npm run prisma:seed --prefix backend`), frontend `http://localhost:5173`, API `http://localhost:3000/api`.

Comptes : voir § Comptes seedés dans `docs/API.md` (mot de passe `demo123`).

**Recette MOA assistée :** voir `docs/32-Framework-Recette-Automatisee.md` · matrice `docs/31-Matrice-Automatisation-Recette.md` · manuel MOA `docs/33-Cahier-Recette-MOA-Manuelle.md` · commande `npm run test:recette`.

Colonnes ajoutées : **Automatisé** (Oui / Non / Partiel) · **Test associé** · **À valider MOA** · **Commentaire**.

---

## REC-001 — Création chantier

| Champ | Valeur |
|-------|--------|
| **Objectif** | Vérifier la création d'un chantier avec statut initial Préparation |
| **Préconditions** | Connecté en conducteur (`conducteur@batinova.fr`) |
| **Étapes** | 1. Aller sur `/chantiers/nouveau` 2. Remplir référence CHT-XXX, nom, client, adresse, dates 3. Soumettre |
| **Résultat attendu** | Chantier créé, redirection fiche, statut « Préparation », entrée historique |
| **Automatisé** | Oui |
| **Test associé** | `e2e/tests/recette/mvp-chantiers.spec.ts` @REC-001 |
| **À valider MOA** | Non |
| **Commentaire** | Contrôle factuel création + statut initial |
| **Statut** | ☐ À exécuter |

---

## REC-002 — Modification chantier

| Champ | Valeur |
|-------|--------|
| **Objectif** | Mettre à jour les informations d'un chantier existant |
| **Préconditions** | Connecté conducteur, chantier CHT-001 accessible |
| **Étapes** | 1. Ouvrir fiche CHT-001 2. Modifier le client 3. Enregistrer |
| **Résultat attendu** | Données mises à jour, historique tracé |
| **Automatisé** | Oui |
| **Test associé** | `e2e/tests/recette/mvp-chantiers.spec.ts` @REC-002 (API) |
| **À valider MOA** | Non |
| **Commentaire** | PATCH client via API réelle |
| **Statut** | ☐ À exécuter |

---

## REC-003 — Changement statut

| Champ | Valeur |
|-------|--------|
| **Objectif** | Avancer le workflow d'un chantier (±1 étape) |
| **Préconditions** | Connecté conducteur, chantier en Préparation ou étape suivante |
| **Étapes** | 1. Ouvrir fiche 2. Changer statut vers étape suivante 3. Confirmer |
| **Résultat attendu** | Nouveau statut affiché, historique mis à jour |
| **Automatisé** | Oui |
| **Test associé** | `e2e/tests/recette/mvp-chantiers.spec.ts` @REC-003 (API) |
| **À valider MOA** | Non |
| **Commentaire** | Avancement CHT-005 → Réalisation |
| **Statut** | ☐ À exécuter |

---

## REC-004 — Retour arrière avec motif

| Champ | Valeur |
|-------|--------|
| **Objectif** | Valider RG-DATA-004 — motif obligatoire en retour arrière |
| **Préconditions** | Chantier en statut > Préparation |
| **Étapes** | 1. Tenter retour statut sans motif 2. Saisir motif 3. Confirmer |
| **Résultat attendu** | Refus sans motif ; succès avec motif enregistré dans l'historique |
| **Automatisé** | Oui |
| **Test associé** | `e2e/tests/recette/mvp-chantiers.spec.ts` @REC-004 (API) |
| **À valider MOA** | Non |
| **Commentaire** | RG-DATA-004 vérifié par API |
| **Statut** | ☐ À exécuter |

---

## REC-005 — Affectation utilisateur

| Champ | Valeur |
|-------|--------|
| **Objectif** | Affecter un chef de chantier depuis l'onglet Équipe |
| **Préconditions** | Connecté conducteur, fiche chantier ouverte |
| **Étapes** | 1. Onglet Équipe 2. « Affecter un membre » 3. Sélectionner utilisateur + fonction 4. Valider |
| **Résultat attendu** | Membre listé, historique « Affectation équipe » |
| **Automatisé** | Partiel |
| **Test associé** | `e2e/tests/recette/mvp-chantiers.spec.ts` @REC-005 |
| **À valider MOA** | Oui — MOA-MVP-05 |
| **Commentaire** | Auto : ouverture modale ; MOA : parcours complet |
| **Statut** | ☐ À exécuter |

---

## REC-006 — Ajout avancement

| Champ | Valeur |
|-------|--------|
| **Objectif** | Saisir une mise à jour d'avancement |
| **Préconditions** | Connecté conducteur ou chef (selon droits), onglet Avancement |
| **Étapes** | 1. « Ajouter une mise à jour » 2. Commentaire + % 3. Valider |
| **Résultat attendu** | Entrée visible dans la timeline avancement |
| **Automatisé** | Partiel |
| **Test associé** | `e2e/tests/recette/mvp-chantiers.spec.ts` @REC-006 |
| **À valider MOA** | Oui — MOA-MVP-06 |
| **Commentaire** | Auto : modale ; MOA : saisie et timeline |
| **Statut** | ☐ À exécuter |

---

## REC-007 — Création réserve

| Champ | Valeur |
|-------|--------|
| **Objectif** | Créer une réserve sur un chantier |
| **Préconditions** | Connecté avec droit création réserve |
| **Étapes** | 1. Onglet Réserves 2. « Créer une réserve » 3. Titre, priorité, description 4. Valider |
| **Résultat attendu** | Réserve listée statut Ouverte |
| **Automatisé** | Partiel |
| **Test associé** | `e2e/tests/recette/mvp-reserves.spec.ts` @REC-007 |
| **À valider MOA** | Oui — MOA-MVP-07 |
| **Commentaire** | Auto : modale ; MOA : création complète |
| **Statut** | ☐ À exécuter |

---

## REC-008 — Levée réserve

| Champ | Valeur |
|-------|--------|
| **Objectif** | Valider la levée d'une réserve par le conducteur |
| **Préconditions** | Réserve En cours sur CHT-003, connecté conducteur |
| **Étapes** | 1. Onglet Réserves CHT-003 2. « Valider levée » sur réserve critique 3. Confirmer |
| **Résultat attendu** | Statut « Levée », historique tracé |
| **Automatisé** | Partiel |
| **Test associé** | `e2e/tests/recette/mvp-reserves.spec.ts` @REC-008 |
| **À valider MOA** | Oui — MOA-MVP-08 |
| **Commentaire** | Auto : levée si bouton visible |
| **Statut** | ☐ À exécuter |

---

## REC-009 — Ajout photo (legacy MVP)

| Champ | Valeur |
|-------|--------|
| **Objectif** | Ajouter une photo par URL / nom de fichier (legacy — préférer REC-EVOL-001) |
| **Automatisé** | — |
| **Test associé** | — |
| **À valider MOA** | Non |
| **Commentaire** | Remplacé par EVOL-001 |
| **Statut** | ☐ Remplacé par upload réel v1.1 |

---

## REC-EVOL-001 — Upload réel photos (Release 1.1-A)

**Gate A :** ✅ validé le 21/06/2026

| ID | Objectif | Automatisé | Test associé | À valider MOA | Statut |
|----|----------|------------|--------------|---------------|--------|
| REC-EVOL-001-01 | Upload JPG depuis fiche chantier | Oui | `evol-001-photos.spec.ts` | Non | ✅ |
| REC-EVOL-001-02 | Refus fichier > 10 Mo | Oui | `evol-001-photos.spec.ts` (API) | Non | ✅ |
| REC-EVOL-001-03 | Suppression + trace historique | Oui | `evol-001-photos.spec.ts` | Non | ✅ |
| REC-EVOL-001-04 | Upload depuis mobile chef | Partiel | `evol-001-photos.spec.ts` | Oui — MOA-PHO-04 | ✅ |
| REC-EVOL-001-05 | Galerie globale `/photos` | Oui | `evol-001-photos.spec.ts` | Non | ✅ |

---

## REC-EVOL-002 — Planning ouvriers (Release 1.1-B)

**Gate B :** ✅ validé le 21/06/2026

| ID | Objectif | Automatisé | Test associé | À valider MOA | Statut |
|----|----------|------------|--------------|---------------|--------|
| REC-EVOL-002-01 | Créer créneau ouvrier | Oui | `evol-002-planning.spec.ts` | Non | ✅ |
| REC-EVOL-002-02 | Conflit affiché et bloquant (409) | Oui | `evol-002-planning.spec.ts` | Non | ✅ |
| REC-EVOL-002-03 | Filtres chantier + ouvrier | Oui | `evol-002-planning.spec.ts` | Non | ✅ |
| REC-EVOL-002-04 | Vue mois + navigation semaine | Partiel | `evol-002-planning.spec.ts` | Oui — MOA-PLA-04 | ✅ |
| REC-EVOL-002-05 | KPI occupation cohérent | Partiel | `evol-002-planning.spec.ts` | Oui — MOA-PLA-05 | ✅ |
| REC-EVOL-002-06 | Désactiver ouvrier — absent listes | Oui | `evol-002-planning.spec.ts` | Non | ✅ |
| REC-EVOL-002-07 | Périmètre RG-PLA-04 | Oui | `evol-002-planning.spec.ts` | Non | ✅ |

### REC-EVOL-002-07 — Périmètre chantiers (RG-PLA-04)

| Champ | Valeur |
|-------|--------|
| **Objectif** | Vérifier que l'UI et l'API n'exposent que les chantiers autorisés |
| **Préconditions** | Connecté `conducteur@batinova.fr` (Marc Dupont — CHT-001, 003, 005…) |
| **Étapes** | 1. Ouvrir `/planning` 2. Consulter filtre chantier 3. Ouvrir modale « Affecter un ouvrier » |
| **Résultat attendu** | CHT-002 (Sophie Martin) absent des listes ; affectation sur CHT-001 acceptée |
| **Statut** | ✅ Exécuté 21/06/2026 |

---

## REC-EVOL-003 — Budget & ressources (Release 1.1-C)

| ID | Scénario | Automatisé | Test associé | À valider MOA | Statut |
|----|----------|------------|--------------|---------------|--------|
| REC-EVOL-003-01 | Synthèse CHT-001 — 85 %+ consommation, alerte BUDGET_80 | Oui | `evol-003-budget.spec.ts` | Non | ☐ |
| REC-EVOL-003-02 | Dépense DRAFT/CANCELLED n'impacte pas consommé | Oui | `evol-003-budget.spec.ts` (API) | Non | ☐ |
| REC-EVOL-003-03 | budgetSpent = dépenses VALIDATED | Oui | `evol-003-budget.spec.ts` (API) | Oui — MOA-BUD-01 | ☐ |
| REC-EVOL-003-04 | Chef lecture seule onglet Budget | Oui | `evol-003-budget.spec.ts` | Non | ☐ |
| REC-EVOL-003-05 | Dashboard direction — KPI > 80 % / > 100 % | Oui | `evol-003-budget.spec.ts` | Non | ☐ |
| REC-EVOL-003-06 | Conducteur non référent — message accès explicite | Oui | `evol-003-budget.spec.ts` | Non | ☐ |

### REC-EVOL-003-06 — Message accès budget (conducteur)

| Champ | Valeur |
|-------|--------|
| **Objectif** | Vérifier le message métier lors d'un accès budget refusé |
| **Préconditions** | Connecté `conducteur@batinova.fr` (Marc Dupont) |
| **Étapes** | 1. Ouvrir un chantier d'un **autre** conducteur (ex. CHT-020) 2. Onglet **Budget** |
| **Résultat attendu** | Titre *Accès restreint* + texte *Accès réservé au conducteur référent de ce chantier.* — **sans** bandeau « placeholder » |
| **Statut** | ☐ À exécuter |

**Breaking change à valider avec MOA :** `budgetSpent` = dépenses VALIDATED (plus % avancement).

---

## REC-010 — Consultation historique

| Champ | Valeur |
|-------|--------|
| **Objectif** | Vérifier la traçabilité des actions |
| **Préconditions** | Chantier avec historique seedé (CHT-001) |
| **Étapes** | 1. Ouvrir fiche 2. Onglet Historique |
| **Résultat attendu** | Entrées datées avec auteur et action |
| **Automatisé** | Oui |
| **Test associé** | `e2e/tests/recette/mvp-chantiers.spec.ts` @REC-010 |
| **À valider MOA** | Non |
| **Commentaire** | Présence entrée « Création chantier » |
| **Statut** | ☐ À exécuter |

---

## REC-011 — Dashboard conducteur

| Champ | Valeur |
|-------|--------|
| **Objectif** | KPI et listes alimentés par l'API PostgreSQL |
| **Préconditions** | Connecté `conducteur@batinova.fr` |
| **Étapes** | 1. Accéder `/dashboard` 2. Vérifier KPI actifs/retard/réserves 3. Alertes et listes récentes |
| **Résultat attendu** | Données cohérentes avec portefeuille Marc Dupont (CHT-001, 003, 005, 006, 011, 013, 016, 019) |
| **Automatisé** | Partiel |
| **Test associé** | `e2e/tests/recette/mvp-chantiers.spec.ts` @REC-011 |
| **À valider MOA** | Oui — MOA-MVP-11 |
| **Commentaire** | Auto : KPI visibles ; MOA : cohérence chiffres |
| **Statut** | ☐ À exécuter |

---

## REC-012 — Dashboard direction

| Champ | Valeur |
|-------|--------|
| **Objectif** | Vue consolidée entreprise en lecture seule |
| **Préconditions** | Connecté `direction@batinova.fr` |
| **Étapes** | 1. Accéder `/dashboard/direction` 2. KPI, graphiques, chantiers à risque 3. Drill-down CHT-003 |
| **Résultat attendu** | 20 chantiers seedés, répartition statuts/conducteurs, pas de boutons modification |
| **Automatisé** | Partiel |
| **Test associé** | `e2e/tests/recette/mvp-chantiers.spec.ts` @REC-012 |
| **À valider MOA** | Oui — MOA-MVP-12 |
| **Commentaire** | Auto : graphique budget ; MOA : drill-down |
| **Statut** | ☐ À exécuter |

---

## REC-013 — Refus clôture avec réserve ouverte

| Champ | Valeur |
|-------|--------|
| **Objectif** | Empêcher clôture si réserves ouvertes (règle métier MVP) |
| **Préconditions** | Chantier CHT-003 avec réserves critiques ouvertes |
| **Étapes** | 1. Tenter passage statut Clôture ou Réception sans levée des réserves |
| **Résultat attendu** | Refus ou avertissement métier (selon implémentation workflow) |
| **Automatisé** | Oui |
| **Test associé** | `e2e/tests/recette/mvp-chantiers.spec.ts` @REC-013 (API) |
| **À valider MOA** | Non |
| **Commentaire** | RG-REC-013 via API clôture CHT-003 |
| **Statut** | ☐ À exécuter |

---

## REC-014 — Contrôle des rôles

| Champ | Valeur |
|-------|--------|
| **Objectif** | Matrice d'accès MVP respectée |
| **Préconditions** | Comptes seedés tous rôles |
| **Étapes** | 1. Conducteur → `/dashboard/direction` refusé 2. Direction → dashboard direction OK 3. Assistante → `/chantiers` 4. Chef → `/mobile` |
| **Résultat attendu** | Redirections conformes SPEC-UI §4.3 |
| **Automatisé** | Oui |
| **Test associé** | `e2e/tests/recette/mvp-auth.spec.ts` @REC-014 |
| **À valider MOA** | Non |
| **Commentaire** | Matrice rôles MVP |
| **Statut** | ☐ À exécuter |

---

## REC-015 — Connexion JWT

| Champ | Valeur |
|-------|--------|
| **Objectif** | Authentification réelle API + session frontend |
| **Préconditions** | API et Postgres démarrés |
| **Étapes** | 1. Login email/mot de passe 2. Vérifier redirection par rôle 3. Appel API authentifié (`GET /auth/me`) |
| **Résultat attendu** | JWT valide, session localStorage, accès routes protégées |
| **Automatisé** | Oui |
| **Test associé** | `e2e/tests/recette/mvp-auth.spec.ts` @REC-015 |
| **À valider MOA** | Non |
| **Commentaire** | Login UI + GET /auth/me |
| **Statut** | ☐ À exécuter |

---

*Document créé Phase H — à cocher lors de la campagne recette métier.*
