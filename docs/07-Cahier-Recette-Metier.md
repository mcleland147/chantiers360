# Cahier de recette métier — Chantiers360 MVP

Environnement : seed recette (`npm run prisma:seed --prefix backend`), frontend `http://localhost:5173`, API `http://localhost:3000/api`.

Comptes : voir § Comptes seedés dans `docs/API.md` (mot de passe `demo123`).

---

## REC-001 — Création chantier

| Champ | Valeur |
|-------|--------|
| **Objectif** | Vérifier la création d'un chantier avec statut initial Préparation |
| **Préconditions** | Connecté en conducteur (`conducteur@batinova.fr`) |
| **Étapes** | 1. Aller sur `/chantiers/nouveau` 2. Remplir référence CHT-XXX, nom, client, adresse, dates 3. Soumettre |
| **Résultat attendu** | Chantier créé, redirection fiche, statut « Préparation », entrée historique |
| **Statut** | ☐ À exécuter |

---

## REC-002 — Modification chantier

| Champ | Valeur |
|-------|--------|
| **Objectif** | Mettre à jour les informations d'un chantier existant |
| **Préconditions** | Connecté conducteur, chantier CHT-001 accessible |
| **Étapes** | 1. Ouvrir fiche CHT-001 2. Modifier le client 3. Enregistrer |
| **Résultat attendu** | Données mises à jour, historique tracé |
| **Statut** | ☐ À exécuter |

---

## REC-003 — Changement statut

| Champ | Valeur |
|-------|--------|
| **Objectif** | Avancer le workflow d'un chantier (±1 étape) |
| **Préconditions** | Connecté conducteur, chantier en Préparation ou étape suivante |
| **Étapes** | 1. Ouvrir fiche 2. Changer statut vers étape suivante 3. Confirmer |
| **Résultat attendu** | Nouveau statut affiché, historique mis à jour |
| **Statut** | ☐ À exécuter |

---

## REC-004 — Retour arrière avec motif

| Champ | Valeur |
|-------|--------|
| **Objectif** | Valider RG-DATA-004 — motif obligatoire en retour arrière |
| **Préconditions** | Chantier en statut > Préparation |
| **Étapes** | 1. Tenter retour statut sans motif 2. Saisir motif 3. Confirmer |
| **Résultat attendu** | Refus sans motif ; succès avec motif enregistré dans l'historique |
| **Statut** | ☐ À exécuter |

---

## REC-005 — Affectation utilisateur

| Champ | Valeur |
|-------|--------|
| **Objectif** | Affecter un chef de chantier depuis l'onglet Équipe |
| **Préconditions** | Connecté conducteur, fiche chantier ouverte |
| **Étapes** | 1. Onglet Équipe 2. « Affecter un membre » 3. Sélectionner utilisateur + fonction 4. Valider |
| **Résultat attendu** | Membre listé, historique « Affectation équipe » |
| **Statut** | ☐ À exécuter |

---

## REC-006 — Ajout avancement

| Champ | Valeur |
|-------|--------|
| **Objectif** | Saisir une mise à jour d'avancement |
| **Préconditions** | Connecté conducteur ou chef (selon droits), onglet Avancement |
| **Étapes** | 1. « Ajouter une mise à jour » 2. Commentaire + % 3. Valider |
| **Résultat attendu** | Entrée visible dans la timeline avancement |
| **Statut** | ☐ À exécuter |

---

## REC-007 — Création réserve

| Champ | Valeur |
|-------|--------|
| **Objectif** | Créer une réserve sur un chantier |
| **Préconditions** | Connecté avec droit création réserve |
| **Étapes** | 1. Onglet Réserves 2. « Créer une réserve » 3. Titre, priorité, description 4. Valider |
| **Résultat attendu** | Réserve listée statut Ouverte |
| **Statut** | ☐ À exécuter |

---

## REC-008 — Levée réserve

| Champ | Valeur |
|-------|--------|
| **Objectif** | Valider la levée d'une réserve par le conducteur |
| **Préconditions** | Réserve En cours sur CHT-003, connecté conducteur |
| **Étapes** | 1. Onglet Réserves CHT-003 2. « Valider levée » sur réserve critique 3. Confirmer |
| **Résultat attendu** | Statut « Levée », historique tracé |
| **Statut** | ☐ À exécuter |

---

## REC-009 — Ajout photo (legacy MVP)

| Champ | Valeur |
|-------|--------|
| **Objectif** | Ajouter une photo par URL / nom de fichier (legacy — préférer REC-EVOL-001) |
| **Statut** | ☐ Remplacé par upload réel v1.1 |

---

## REC-EVOL-001 — Upload réel photos (Release 1.1-A)

| ID | Objectif | Statut |
|----|----------|--------|
| REC-EVOL-001-01 | Upload 3 JPG depuis fiche chantier | ☐ |
| REC-EVOL-001-02 | Refus fichier > 10 Mo | ☐ |
| REC-EVOL-001-03 | Suppression + trace historique « Suppression photo » | ☐ |
| REC-EVOL-001-04 | Upload depuis mobile chef | ☐ |
| REC-EVOL-001-05 | Galerie globale `/photos` à jour | ☐ |

---

## REC-010 — Consultation historique

| Champ | Valeur |
|-------|--------|
| **Objectif** | Vérifier la traçabilité des actions |
| **Préconditions** | Chantier avec historique seedé (CHT-001) |
| **Étapes** | 1. Ouvrir fiche 2. Onglet Historique |
| **Résultat attendu** | Entrées datées avec auteur et action |
| **Statut** | ☐ À exécuter |

---

## REC-011 — Dashboard conducteur

| Champ | Valeur |
|-------|--------|
| **Objectif** | KPI et listes alimentés par l'API PostgreSQL |
| **Préconditions** | Connecté `conducteur@batinova.fr` |
| **Étapes** | 1. Accéder `/dashboard` 2. Vérifier KPI actifs/retard/réserves 3. Alertes et listes récentes |
| **Résultat attendu** | Données cohérentes avec portefeuille Marc Dupont (CHT-001, 003, 005, 006, 011, 013, 016, 019) |
| **Statut** | ☐ À exécuter |

---

## REC-012 — Dashboard direction

| Champ | Valeur |
|-------|--------|
| **Objectif** | Vue consolidée entreprise en lecture seule |
| **Préconditions** | Connecté `direction@batinova.fr` |
| **Étapes** | 1. Accéder `/dashboard/direction` 2. KPI, graphiques, chantiers à risque 3. Drill-down CHT-003 |
| **Résultat attendu** | 20 chantiers seedés, répartition statuts/conducteurs, pas de boutons modification |
| **Statut** | ☐ À exécuter |

---

## REC-013 — Refus clôture avec réserve ouverte

| Champ | Valeur |
|-------|--------|
| **Objectif** | Empêcher clôture si réserves ouvertes (règle métier MVP) |
| **Préconditions** | Chantier CHT-003 avec réserves critiques ouvertes |
| **Étapes** | 1. Tenter passage statut Clôture ou Réception sans levée des réserves |
| **Résultat attendu** | Refus ou avertissement métier (selon implémentation workflow) |
| **Statut** | ☐ À exécuter — *règle documentée, enforcement partiel MVP* |

---

## REC-014 — Contrôle des rôles

| Champ | Valeur |
|-------|--------|
| **Objectif** | Matrice d'accès MVP respectée |
| **Préconditions** | Comptes seedés tous rôles |
| **Étapes** | 1. Conducteur → `/dashboard/direction` refusé 2. Direction → dashboard direction OK 3. Assistante → `/chantiers` 4. Chef → `/mobile` |
| **Résultat attendu** | Redirections conformes SPEC-UI §4.3 |
| **Statut** | ☐ À exécuter |

---

## REC-015 — Connexion JWT

| Champ | Valeur |
|-------|--------|
| **Objectif** | Authentification réelle API + session frontend |
| **Préconditions** | API et Postgres démarrés |
| **Étapes** | 1. Login email/mot de passe 2. Vérifier redirection par rôle 3. Appel API authentifié (`GET /auth/me`) |
| **Résultat attendu** | JWT valide, session localStorage, accès routes protégées |
| **Statut** | ☐ À exécuter |

---

*Document créé Phase H — à cocher lors de la campagne recette métier.*
