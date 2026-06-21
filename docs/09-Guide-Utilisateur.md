# Guide utilisateur — Chantiers360 MVP

**Version :** 1.0  
**Date :** 20/06/2026  
**Public :** Utilisateurs métier BatiNova  
**URL application :** http://localhost:5173 (recette) — à adapter en production

**Mot de passe démo :** `demo123` (environnement seed uniquement)

---

## 1. Connexion

1. Ouvrir l’application → écran **Connexion**
2. Saisir **e-mail** et **mot de passe**
3. Cliquer **Se connecter**

Redirection automatique selon le rôle :

| Rôle | Écran d’accueil |
|------|-----------------|
| Conducteur de travaux | `/dashboard` |
| Direction | `/dashboard/direction` |
| Assistante administrative | `/chantiers` |
| Chef de chantier | `/mobile` |

**Déconnexion :** bouton **Déconnexion** dans la barre supérieure.

---

## 2. Conducteur de travaux

**Compte démo :** `conducteur@batinova.fr`

### Navigation

- **Dashboard** — pilotage portefeuille
- **Chantiers** — liste et fiches
- **Réserves** — vue transversale
- **Photos** — galerie transversale
- **Planning** — affectations ouvriers (semaine / mois)

### Dashboard conducteur

- **KPI :** chantiers actifs, en retard (RG-001), réserves ouvertes, réserves critiques
- **Alertes :** retards et réserves critiques
- **Chantiers récents** — accès direct aux fiches
- **Réserves récentes** — priorités Haute / Critique

### Chantiers

- **Créer** : `/chantiers/nouveau` — référence `CHT-XXX`, statut initial **Préparation**
- **Modifier** les informations chantier
- **Changer le statut** — workflow 6 étapes (±1 étape ; motif si retour arrière)
- **Onglets fiche :**
  - **Équipe** — affecter un membre (conducteur uniquement)
  - **Avancement** — ajouter commentaire + %
  - **Réserves** — créer, valider levée
  - **Photos** — upload JPG/PNG depuis l’explorateur (jusqu’à 10 fichiers, 10 Mo max)
  - **Historique** — trace des actions

### Droits clés

| Action | Autorisé |
|--------|----------|
| Créer / modifier chantier | ✅ |
| Changer statut | ✅ |
| Affecter équipe | ✅ |
| Valider levée réserve | ✅ |
| Dashboard direction | ❌ |

### Planning ouvriers

- Accéder à **Planning** dans le menu
- **Vue semaine** (défaut) ou **mois** — navigation période précédente / suivante
- **Filtrer** par chantier et par ouvrier
- **Créer un créneau** : ouvrier, chantier, date, horaires — conflit bloqué avec message détaillé
- **KPI occupation** : % heures planifiées / référentiel 35 h/semaine
- **Gérer les ouvriers** : création et désactivation (ouvrier inactif absent des listes d'affectation)

---

## 3. Chef de chantier

**Compte démo :** `chef@batinova.fr`

### Navigation

- **Vue mobile** — écran simplifié terrain
- **Chantiers** — consultation fiches affectées
- **Réserves** — création
- **Photos** — ajout

### Usage terrain

1. Se connecter → **Vue mobile**
2. Accéder aux chantiers via **Chantiers**
3. Sur la fiche :
   - Ajouter **avancement** (commentaire, %)
   - **Créer une réserve** (titre, priorité, description)
   - **Ajouter une photo** — sélectionner un ou plusieurs fichiers JPG/PNG, choisir la catégorie
   - **Supprimer une photo** — icône corbeille avec confirmation

### Limites MVP

- Upload depuis l’appareil photo / galerie (explorateur de fichiers)
- Aperçu plein écran via l’application (pas d’URL externe)
- Pas d’affectation équipe
- Pas de validation levée réserve (réservé conducteur)

---

## 4. Assistante administrative

**Compte démo :** `assistante@batinova.fr`

### Navigation

- **Chantiers** uniquement (pas de dashboard conducteur)

### Missions

- Consulter la liste des chantiers
- **Créer** un chantier (informations administratives)
- **Modifier** nom, client, adresse, dates, budget
- Pas de changement de statut workflow ni gestion réserves en MVP étendu*

\* Les permissions d’édition chantier sont ouvertes ; le changement de statut reste typiquement réservé au conducteur dans l’usage métier.

### Limites

- Pas d’accès dashboard direction
- Pas d’accès `/dashboard` conducteur (redirection vers `/chantiers`)

---

## 5. Direction

**Compte démo :** `direction@batinova.fr`

### Navigation

- **Dashboard Direction** — vue consolidée
- **Chantiers**, **Réserves**, **Photos** — consultation
- **Planning** — consultation + KPI occupation

### Dashboard direction (consultation seule — RG-012)

- **KPI entreprise :** total chantiers, retards, réserves ouvertes/critiques
- **Chantiers à risque** — retard et/ou réserve critique
- **Répartition par statut** et **par conducteur**
- **Tendance mensuelle** et **budget consolidé**
- **Aucun bouton** Créer / Modifier / Supprimer

### Usage

1. Analyser les indicateurs
2. Cliquer un chantier à risque → fiche détail (lecture)
3. Suivre l’avancement des portefeuilles par conducteur

---

## 6. Terminologie

| Terme UI | Signification |
|----------|---------------|
| Chantier | Opération de construction gérée |
| Réserve | Point de contrôle / non-conformité |
| Réalisation | Phase d’exécution travaux (statut) |
| En retard | Badge calculé si date fin dépassée (≠ Clôture) |
| Levée | Réserve clôturée |

---

## 7. Aide et support

- Documentation API (intégrateurs) : `/api/docs`
- Cahier de recette métier : `docs/07-Cahier-Recette-Metier.md`
- Problème de connexion : vérifier que l’API (`/api/health`) est disponible

---

*Guide utilisateur MVP — Phase I — BatiNova*
