# Spécification UI — Chantiers360 MVP

**Version :** 1.0  
**Date :** 20/06/2026  
**Statut :** À valider avant implémentation visuelle  
**Sources :** SFG MVP, cadrage validé, maquettes Figma Make (`YuUWAKtyVMcIgfnpbAjLwr`), socle React existant

---

## 1. Synthèse

Cette spécification aligne les maquettes Figma Make sur le cadrage fonctionnel MVP validé. Elle définit les écrans retenus, les corrections terminologiques obligatoires, le mapping vers le socle React, et l’ordre d’implémentation visuelle.

### 1.1 Principes directeurs

| Principe | Application |
|---|---|
| Terminologie métier | **Chantier**, **Réserve**, **Réalisation** (jamais Projet / Problème / Exécution) |
| Rôles MVP | Direction, Assistante administrative, Conducteur de travaux, Chef de chantier |
| Rôle Administrateur | Hors MVP — aucun accès navigation |
| Affectations équipes | Intégrées à la fiche chantier (onglet Équipes), pas d’écran dédié prioritaire |
| Responsive | Desktop-first (conducteur, direction, assistante) ; mobile-first (chef de chantier) |
| Données | Connectées API au fil de l’implémentation ; maquettes Figma = référence visuelle + structure |

### 1.2 Mapping global Figma → React

| Écran Figma Make | Page React cible | Statut MVP |
|---|---|---|
| `login` | `LoginPage` | ✅ MVP |
| `dashboard` (rôle PM) | `DashboardConducteurPage` | ✅ MVP |
| `dashboard` (rôle executive) | `DashboardDirectionPage` | ✅ MVP |
| `projects` | `ChantiersListPage` | ✅ MVP |
| `project-detail` | `ChantierDetailPage` | ✅ MVP |
| `issues` | `ReservesPage` | ✅ MVP |
| `photos` | `PhotosPage` | ✅ MVP |
| `mobile` | `MobileChefPage` | ✅ MVP |
| `teams` | — (contenu dans onglet Équipes) | ⚠️ Masqué navigation |
| `reports` | `ReportsPage` (placeholder) | ⏸️ Hors priorité |
| `admin` | `AdminPage` (placeholder) | ⏸️ Masqué navigation |
| Création / édition chantier (implicite Figma) | `ChantierFormPage` | ✅ MVP (sous-écran) |

### 1.3 Architecture de routes proposée

Renommage recommandé : `projects` → `chantiers` pour cohérence métier.

```
/login                          → LoginPage
/                               → redirection selon rôle
/dashboard                      → DashboardConducteurPage (Conducteur, Assistante*)
/dashboard/direction            → DashboardDirectionPage (Direction)
/chantiers                      → ChantiersListPage
/chantiers/nouveau              → ChantierFormPage (création)
/chantiers/:id                  → ChantierDetailPage
/chantiers/:id/modifier         → ChantierFormPage (édition)
/reserves                       → ReservesPage
/photos                         → PhotosPage
/mobile                         → MobileChefPage

# Placeholders — code présent, navigation masquée
/reports                        → ReportsPage
/admin                          → AdminPage
```

\* L’assistante administrative accède au dashboard conducteur simplifié ou à la liste chantiers selon habilitation (voir §2.9).

---

## 2. Corrections terminologiques obligatoires

À appliquer **avant** toute implémentation visuelle (UI, labels, enums, routes, types).

| Contexte Figma | Terme corrigé MVP | Portée |
|---|---|---|
| Projet / Projets | **Chantier / Chantiers** | Navigation, titres, tables, routes, variables |
| Problème / Problèmes | **Réserve / Réserves** | Navigation, kanban, badges, filtres |
| Exécution | **Réalisation** | Statuts chantier, workflow, graphiques |
| Ouvert / Résolu (réserve) | **Ouverte / Levée** | Statuts réserve |
| En retard (statut chantier) | **Indicateur dérivé**, pas un statut officiel | Badge « En retard » calculé (RG-001), statut métier reste l’un des 6 |
| PM / Conducteur | **Conducteur de travaux** | Libellés rôles |
| executive / DIR | **Direction** | Libellés rôles |
| CDG / mobile | **Chef de chantier** | Libellés rôles |
| Administration (nav) | **Masqué** | Pas de lien sidebar MVP |
| Rapports (nav) | **Masqué ou secondaire** | Placeholder uniquement |

### 2.1 Enums UI alignés cadrage

**Statuts chantier (6 valeurs fixes)**  
`Préparation` → `Planification` → `Démarrage` → `Réalisation` → `Réception` → `Clôture`

**Statuts réserve (3 valeurs fixes)**  
`Ouverte` → `En cours` → `Levée`

**Priorités réserve**  
`Faible` · `Moyenne` · `Haute` · `Critique`

**Catégories photo**  
`Avant travaux` · `Pendant travaux` · `Après travaux`

---

## 3. Écarts Figma vs cadrage validé

| # | Écart Figma | Cadrage validé | Décision UI |
|---|---|---|---|
| E1 | Statut « Exécution » | « Réalisation » | Remplacer partout |
| E2 | Statut « En retard » dans la liste des statuts | Retard = alerte calculée (RG-001) | Conserver badge visuel « En retard », retirer des filtres statut officiels |
| E3 | Réserves nommées « Problèmes », statut « Résolu » | « Réserves », statut « Levée » | Renommer + corriger workflow |
| E4 | Priorités Haute / Moyenne / Basse | Faible / Moyenne / Haute / Critique | Aligner sur 4 niveaux cadrage |
| E5 | Écran Équipes dédié dans la nav | Affectation via fiche chantier | Masquer nav ; conserver onglet Équipes |
| E6 | Écran Administration + rôle admin | Administrateur hors MVP | Placeholder code, nav masquée |
| E7 | Écran Rapports riche | Reporting intégré dashboards | Placeholder, hors priorité |
| E8 | % avancement systématique (barres) | Avancement = journal + commentaire (RG-006) | Conserver % comme indicateur visuel optionnel si présent dans dernière mise à jour ; ne pas en faire un statut |
| E9 | Accès rapide démo 3 rôles sur login | 4 rôles MVP sans Administrateur | Retirer tout bouton « Admin » |
| E10 | Conducteur = créateur unique | Assistante crée, conducteur pilote | Bouton « Nouveau chantier » visible Assistante + Conducteur (droits différenciés) |
| E11 | Clôture réserve = statut « Résolu » | Levée + validation conducteur (RG-008) | Action « Valider la levée » réservée au conducteur |
| E12 | Données mock globales | Données filtrées par rôle / affectation | Chef de chantier : chantiers affectés uniquement |

---

## 4. Périmètre écrans

### 4.1 Écrans MVP retenus (8 + sous-écrans)

| # | Écran | Priorité implémentation |
|---|---|---|
| 1 | Connexion | P2 |
| 2 | Dashboard conducteur | **P1 — premier écran à implémenter** |
| 3 | Dashboard direction | P3 |
| 4 | Liste des chantiers | P2 |
| 5 | Détail chantier (+ onglets) | P2 |
| 6 | Réserves (vue globale) | P3 |
| 7 | Photos (vue globale) | P3 |
| 8 | Vue mobile chef de chantier | P4 |

Sous-écrans MVP inclus : création chantier, modification chantier, changement de statut (modal), formulaires avancement / réserve / photo.

### 4.2 Écrans hors MVP ou masqués

| Écran Figma | Traitement |
|---|---|
| Équipes (page dédiée) | **Masqué** — fonctionnalité dans onglet Équipes du détail chantier |
| Rapports | **Placeholder** — route `/reports` possible, pas de lien navigation |
| Administration | **Placeholder** — route `/admin` possible, pas de lien navigation |
| Planning détaillé mobile (« Voir le planning ») | **Hors MVP** — bouton masqué ou désactivé |
| Portail client / ouvriers | **Hors MVP** |

### 4.3 Navigation MVP par rôle

| Entrée navigation | Direction | Assistante | Conducteur | Chef chantier |
|---|---|---|---|---|
| Dashboard | ✅ (direction) | ❌ | ✅ (conducteur) | ❌ |
| Chantiers | ✅ lecture | ✅ création + lecture | ✅ complet | ✅ affectés |
| Réserves | ✅ lecture | ❌ | ✅ complet | ✅ création + suivi |
| Photos | ✅ lecture | ❌ | ✅ lecture | ✅ ajout |
| Vue mobile | ❌ | ❌ | ❌ | ✅ (layout dédié) |
| Rapports | ❌ | ❌ | ❌ | ❌ |
| Administration | ❌ | ❌ | ❌ | ❌ |

---

## 5. Spécifications détaillées par écran

---

### 5.1 Connexion

| Attribut | Valeur |
|---|---|
| **Nom** | Connexion |
| **Objectif métier** | Authentifier l’utilisateur et orienter vers l’espace adapté à son rôle |
| **Rôle cible** | Tous les rôles MVP |
| **Route React** | `/login` → `pages/LoginPage.tsx` |
| **Layout** | `AuthLayout` (sans sidebar) |
| **Priorité MVP** | P2 |

**Composants principaux**
- `LoginForm` — email, mot de passe, bouton connexion
- `BrandPanel` — identité Chantiers360 / BatiNova (panneau gauche desktop)
- `ForgotPasswordLink` — lien « Mot de passe oublié » (UI seule, flux hors MVP si non API)
- `Alert` — erreurs authentification

**Données affichées**
- Champs vides ou préremplis dev uniquement
- Messages d’erreur API (`401`, compte inactif)

**Actions utilisateur**
- Saisir identifiants
- Se connecter
- (Optionnel MVP) Mot de passe oublié — lien inactif ou message « contacter administrateur »

**Règles de gestion**
- RG-013 : toute action ultérieure liée à un utilisateur authentifié
- Redirection post-login :
  - `DIRECTION` → `/dashboard/direction`
  - `CONDUCTEUR_TRAVAUX` → `/dashboard`
  - `ASSISTANTE_ADMINISTRATIVE` → `/chantiers`
  - `CHEF_CHANTIER` → `/mobile`

**Corrections vs Figma**
- Supprimer les boutons d’accès rapide démo « PM / DIR / CDG » en production
- Conserver le visuel split-screen Figma (bleu `#0F2340` + accent orange)
- Retirer toute mention « Administrateur »

---

### 5.2 Dashboard conducteur

| Attribut | Valeur |
|---|---|
| **Nom** | Dashboard conducteur |
| **Objectif métier** | Piloter l’ensemble des chantiers du conducteur : KPI, alertes, accès rapide |
| **Rôle cible** | Conducteur de travaux |
| **Route React** | `/dashboard` → `pages/DashboardConducteurPage.tsx` |
| **Layout** | `AppLayout` + `Sidebar` + `TopBar` |
| **Priorité MVP** | **P1 — premier écran à implémenter** |

**Composants principaux**
- `KpiCard` × 4 — chantiers actifs, en retard, réserves ouvertes, (option) photos du mois
- `AlertsPanel` — retards + réserves critiques
- `RecentChantiersList` — tableau / liste cliquable
- `RecentReservesList` — réserves haute priorité
- `PerformanceChart` — tendance mensuelle (optionnel MVP si API reporting prête)
- `StatusDistributionChart` — répartition par statut (optionnel)

**Données affichées**
- KPI agrégés (conducteur ou périmètre global selon habilitation)
- Chantiers récents : référence, nom, statut, date fin prévue, nb réserves
- Alertes : type (retard / réserve critique), chantier, message, date
- Réserves récentes : référence, titre, priorité, statut, chantier

**Actions utilisateur**
- Consulter un chantier (clic ligne → `/chantiers/:id`)
- Filtrer / rechercher (barre top ou filtres liste)
- Accéder à la liste complète des chantiers
- Accéder aux réserves / alertes

**Règles de gestion**
- RG-001 : retard = date > fin prévue ET statut ≠ Clôturé
- RG-012 : consultation sans modification — pas d’historisation requise

**Corrections vs Figma**
- « Projets actifs » → **Chantiers actifs**
- « Problèmes ouverts » → **Réserves ouvertes**
- « Problèmes récents » → **Réserves récentes**
- Badge statut : utiliser les 6 statuts officiels ; « En retard » en badge secondaire calculé
- Sous-titre : « Bonjour {prénom} » depuis profil API `/auth/me`

**Référence Figma** : écran `dashboard` (rôle `pm`), composants KPI + listes + graphiques.

---

### 5.3 Dashboard direction

| Attribut | Valeur |
|---|---|
| **Nom** | Dashboard direction |
| **Objectif métier** | Vision consolidée de l’activité pour le pilotage stratégique |
| **Rôle cible** | Direction |
| **Route React** | `/dashboard/direction` → `pages/DashboardDirectionPage.tsx` |
| **Layout** | `AppLayout` (sidebar lecture seule) |
| **Priorité MVP** | P3 |

**Composants principaux**
- `KpiCard` × 4–5 — total chantiers, en retard, réserves ouvertes, réserves critiques
- `StatusDistributionChart` — répartition par statut
- `ConductorDistributionTable` — répartition par conducteur (SFG)
- `MonthlyTrendChart` — tendances mensuelles
- `RiskChantiersList` — chantiers à risque (retard + réserves critiques)
- `BudgetOverviewChart` — optionnel MVP (présent Figma, non exigé SFG minimal)

**Données affichées**
- Agrégats globaux entreprise
- Liste chantiers à risque
- Indicateurs par statut et par conducteur

**Actions utilisateur**
- Consultation uniquement
- Drill-down vers détail chantier (lecture seule)
- Filtrer par période (mois / trimestre)

**Règles de gestion**
- RG-001, RG-012
- Aucune action de modification (profil Direction)

**Corrections vs Figma**
- « Projets » → **Chantiers**
- « Problèmes » → **Réserves**
- Masquer actions d’édition / création
- Statut « Exécution » → **Réalisation** dans graphiques

**Référence Figma** : `ExecutiveDashboard` (rôle `executive`).

---

### 5.4 Liste des chantiers

| Attribut | Valeur |
|---|---|
| **Nom** | Liste des chantiers |
| **Objectif métier** | Consulter, rechercher et accéder aux chantiers ; initier création |
| **Rôle cible** | Conducteur (complet), Assistante (création), Direction (lecture), Chef (affectés) |
| **Route React** | `/chantiers` → `pages/ChantiersListPage.tsx` |
| **Layout** | `AppLayout` |
| **Priorité MVP** | P2 |

**Composants principaux**
- `PageHeader` — titre + bouton « Nouveau chantier »
- `ChantiersFilters` — statut, conducteur, client, dates
- `SearchInput`
- `ChantiersTable` — colonnes triables
- `StatusBadge` — statut officiel + badge retard optionnel
- `EmptyState` / `LoadingState`

**Données affichées**
- Référence, nom, client, conducteur, statut, date début, date fin prévue
- Indicateurs : nb réserves ouvertes (colonne optionnelle)
- Compteur « X chantiers · Y affichés »

**Actions utilisateur**
- Rechercher, filtrer
- Créer un chantier → `/chantiers/nouveau` (Assistante, Conducteur)
- Consulter → `/chantiers/:id`
- Modifier → `/chantiers/:id/modifier` (selon rôle)

**Règles de gestion**
- RG-002 : statut initial « Préparation » à la création
- RG-013 : création / modification authentifiées
- Chef de chantier : liste filtrée aux chantiers où il est affecté

**Corrections vs Figma**
- Titre « Projets » → **Chantiers**
- Filtre statut : retirer « En retard » des options ; garder badge calculé en colonne
- « Problèmes » colonne → **Réserves**
- Bouton « Nouveau projet » → **Nouveau chantier**

**Référence Figma** : `ProjectsListScreen`.

---

### 5.5 Détail chantier

| Attribut | Valeur |
|---|---|
| **Nom** | Détail chantier |
| **Objectif métier** | Centraliser toutes les informations et actions d’un chantier |
| **Rôle cible** | Tous (droits différenciés par onglet / action) |
| **Route React** | `/chantiers/:id` → `pages/ChantierDetailPage.tsx` |
| **Sous-routes onglets** | `/chantiers/:id?tab=informations|equipes|avancement|reserves|photos|historique` |
| **Layout** | `AppLayout` |
| **Priorité MVP** | P2 |

**Composants principaux**
- `ChantierHeader` — référence, nom, statut, métadonnées, barre avancement
- `ChantierTabs` — 6 onglets
- `ChantierActions` — Modifier, Changer statut, Nouvelle réserve, Ajouter photo, Mise à jour avancement
- **Onglet Informations** : `ChantierInfoCard`, `BudgetCard`, `PhaseStepper` (6 phases)
- **Onglet Équipes** : `AssignmentsList`, `AssignMemberModal` (remplace page Équipes Figma)
- **Onglet Avancement** : `ProgressTimeline`, `ProgressFormModal`
- **Onglet Réserves** : `ReservesList` (filtre chantier)
- **Onglet Photos** : `PhotoGallery` par catégorie
- **Onglet Historique** : `HistoryTimeline`

**Données affichées**
- Général : référence, nom, client, adresse, conducteur, budget, dates, statut, date réception
- Équipes : collaborateur, fonction, date affectation, actif
- Avancement : date, auteur, commentaire, % optionnel
- Réserves : référence, titre, priorité, statut, dates
- Photos : vignette, catégorie, auteur, date
- Historique : action, auteur, ancienne/nouvelle valeur, motif, date

**Actions utilisateur**
- Modifier le chantier (Assistante : admin ; Conducteur : complet)
- Changer le statut (Conducteur) — modal avec motif si retour arrière (RG-004)
- Affecter / retirer un membre (Conducteur) — RG-005 avant Démarrage
- Ajouter mise à jour avancement (Chef, Conducteur)
- Créer réserve (Chef, Conducteur)
- Ajouter / supprimer photo (Chef, Conducteur)
- Valider levée réserve (Conducteur uniquement — RG-008)

**Règles de gestion**
- RG-003, RG-004, RG-005, RG-006, RG-007, RG-008, RG-009, RG-010, RG-011, RG-012, RG-013
- Phase stepper : 6 statuts ; surligner phase courante ; « En retard » = indicateur, pas phase

**Corrections vs Figma**
- Onglet « Problèmes » → **Réserves**
- Phase « Exécution » → **Réalisation**
- « Chef de projet » → **Conducteur de travaux**
- Page Équipes dédiée → **onglet Équipes** uniquement
- Action « Clôturer réserve » → **Valider la levée** (conducteur)

**Référence Figma** : `ProjectDetailScreen` + onglets.

---

### 5.6 Création / modification chantier (sous-écran)

| Attribut | Valeur |
|---|---|
| **Nom** | Formulaire chantier |
| **Objectif métier** | Créer ou modifier le cycle de vie administratif d’un chantier |
| **Rôle cible** | Assistante (création + admin), Conducteur (modification complète) |
| **Route React** | `/chantiers/nouveau`, `/chantiers/:id/modifier` → `pages/ChantierFormPage.tsx` |
| **Priorité MVP** | P2 (inclus backlog US001–US003) |

**Composants principaux**
- `ChantierForm` — champs identification + pilotage
- `ConductorSelect`, `StatusSelect` (édition uniquement, avec workflow)
- `FormActions` — Enregistrer, Annuler

**Données affichées / saisies**
- Référence, nom, client, adresse, conducteur, budget, dates, statut (si édition)

**Actions**
- Enregistrer, annuler
- (Édition) Changer statut via workflow dédié plutôt que select libre si possible

**Règles**
- RG-002, RG-009, RG-013

**Corrections vs Figma**
- Présent implicitement via boutons Figma ; formaliser en page ou drawer selon préférence UX (recommandation : **page dédiée** pour MVP clarté)

---

### 5.7 Réserves (vue globale)

| Attribut | Valeur |
|---|---|
| **Nom** | Réserves |
| **Objectif métier** | Suivre toutes les réserves cross-chantiers |
| **Rôle cible** | Conducteur (complet), Chef (création + suivi), Direction (lecture) |
| **Route React** | `/reserves` → `pages/ReservesPage.tsx` |
| **Layout** | `AppLayout` |
| **Priorité MVP** | P3 |

**Composants principaux**
- `PageHeader` + bouton « Nouvelle réserve »
- `ReserveFilters` — statut, priorité, chantier
- `ViewToggle` — kanban / liste
- `ReserveKanbanBoard` — colonnes Ouverte / En cours / Levée
- `ReservesTable`
- `ReserveCard` — référence, titre, priorité, chantier, assigné
- `ValidateLeveeButton` — conducteur uniquement

**Données affichées**
- Référence, titre, description, chantier, priorité, statut, créateur, dates

**Actions**
- Créer, modifier (si non levée — RG-007)
- Changer statut
- Valider la levée (conducteur — RG-008)
- Ouvrir chantier lié

**Règles**
- RG-007, RG-008, RG-012, RG-013
- Workflow : Ouverte → En cours → Levée (pas de statut « Clôturée »)

**Corrections vs Figma**
- Titre « Problèmes » → **Réserves**
- Colonnes kanban : Ouvert / Résolu → **Ouverte / Levée**
- Priorité « Basse » → **Faible** ; ajouter **Critique**
- Bouton clôture → **Valider la levée**

**Référence Figma** : `IssueManagementScreen`.

---

### 5.8 Photos (vue globale)

| Attribut | Valeur |
|---|---|
| **Nom** | Photos |
| **Objectif métier** | Consulter et déposer des photos terrain cross-chantiers |
| **Rôle cible** | Chef (ajout), Conducteur (consultation), Direction (lecture) |
| **Route React** | `/photos` → `pages/PhotosPage.tsx` |
| **Layout** | `AppLayout` |
| **Priorité MVP** | P3 |

**Composants principaux**
- `CategoryTabs` — Avant / Pendant / Après travaux
- `ChantierFilter`
- `PhotoGrid`
- `PhotoUploadZone`
- `PhotoLightbox`

**Données affichées**
- Vignette, nom fichier, catégorie, chantier, auteur, date, commentaire

**Actions**
- Filtrer par chantier / catégorie / date
- Importer des photos
- Consulter plein écran
- Supprimer (selon rôle)

**Règles**
- RG-012, RG-013
- Contrôles fichier (type, taille) — DAA

**Corrections vs Figma**
- Libellés catégories complets : **Avant travaux**, **Pendant travaux**, **Après travaux**
- « Photothèque des chantiers » OK

**Référence Figma** : `PhotoManagementScreen`.

---

### 5.9 Vue mobile chef de chantier

| Attribut | Valeur |
|---|---|
| **Nom** | Vue mobile chef de chantier |
| **Objectif métier** | Actions terrain rapides (< 30 s, ≤ 3 clics) |
| **Rôle cible** | Chef de chantier |
| **Route React** | `/mobile` → `pages/MobileChefPage.tsx` |
| **Layout** | `MobileLayout` (sans sidebar desktop) |
| **Priorité MVP** | P4 |

**Composants principaux**
- `MobileHeader` — salutation, chantier actif sélecteur
- `QuickActionsGrid` — avancement, photo, réserve
- `MobileAlertsList`
- `MyChantiersList`
- `MobileBottomNav` — Accueil, Chantiers, Réserve, Profil
- Sous-vues : `MobileProgressForm`, `MobileReserveForm`, `MobilePhotoForm`

**Données affichées**
- Chantiers affectés uniquement
- Alertes du jour
- Chantier actif (sélection persistée locale)

**Actions**
- Changer chantier actif
- Mettre à jour avancement
- Prendre / importer photo
- Créer réserve
- Consulter ses chantiers

**Règles**
- RG-006, RG-012, RG-013
- UX : max 3 clics par action (SFG §13)
- Pas de mode hors ligne MVP

**Corrections vs Figma**
- « Signaler un problème » → **Créer une réserve**
- Masquer « Voir le planning » (hors MVP)
- Conserver frame mobile 375px comme référence visuelle dans desktop (aperçu) ou layout natif responsive

**Référence Figma** : `MobileScreen`.

---

### 5.10 Écrans placeholder (hors navigation MVP)

#### Rapports — `pages/ReportsPage.tsx` — `/reports`
- Placeholder : message « Fonctionnalité à venir »
- Pas de lien sidebar MVP
- Priorité : hors MVP

#### Administration — `pages/AdminPage.tsx` — `/admin`
- Placeholder : message « Administration — hors périmètre MVP »
- Pas de lien sidebar MVP
- Rôle Administrateur non exposé

---

## 6. Structure composants réutilisables

À créer dans `frontend/src/components/` avant / pendant l’implémentation :

| Composant | Usage |
|---|---|
| `StatusBadge` | Statuts chantier et réserve |
| `PriorityBadge` | Priorités réserve |
| `KpiCard` | Dashboards |
| `ChantiersTable` | Liste chantiers |
| `ReservesTable` / `ReserveKanban` | Réserves |
| `PhotoGrid` | Galeries |
| `ProgressTimeline` | Avancement |
| `HistoryTimeline` | Historique |
| `PhaseStepper` | Workflow 6 statuts |
| `PageHeader` | Titres + actions |
| `EmptyState`, `LoadingState`, `ErrorState` | États UI |
| `RoleGuard` / `ProtectedRoute` | Routing par rôle |
| `Sidebar`, `TopBar`, `MobileBottomNav` | Layouts |

---

## 7. Charte visuelle (héritée Figma, alignée MVP)

| Token | Valeur | Usage |
|---|---|---|
| Primaire | `#0F2340` | Sidebar, boutons principaux, headers |
| Accent | `#F97316` (orange) | CTA, onglet actif, indicateurs |
| Fond app | `#F1F3F7` / `bg-slate-50` | Arrière-plan |
| Cartes | `bg-white` + `border` + `rounded-xl` | Conteneurs |
| Typo | Inter / system-ui | Corps de texte |
| Icônes | Lucide React | Cohérence Figma |

Conserver la structure Figma (sidebar sombre, topbar blanche, cartes KPI, tables aérées).

---

## 8. Plan d’implémentation visuelle

| Phase | Écran(s) | Prérequis |
|---|---|---|
| **Phase A** | Layout (`Sidebar`, `TopBar`), design tokens Tailwind | — |
| **Phase B** | **Dashboard conducteur** | Phase A |
| **Phase C** | Liste chantiers + Détail (onglet Informations) | Phase A |
| **Phase D** | Détail — onglets Équipes, Avancement, Réserves, Photos, Historique | Phase C |
| **Phase E** | Connexion + guards rôles | API auth |
| **Phase F** | Dashboard direction | Phase B + API reporting |
| **Phase G** | Réserves globale + Photos globale | Phase D |
| **Phase H** | Vue mobile chef de chantier | Phase D |
| **Phase I** | Placeholders Rapports / Admin | Optionnel |

**Ordre validé avec le métier :** commencer par le **Dashboard conducteur** après validation de cette spec.

---

## 9. Checklist de validation

Avant de démarrer le code visuel, confirmer :

- [ ] Terminologie Chantier / Réserve / Réalisation acceptée partout
- [ ] Routes `/chantiers` (renommage depuis `/projects`) validées
- [ ] Navigation MVP par rôle validée
- [ ] Écrans Équipes / Rapports / Admin masqués acceptés
- [ ] « En retard » traité comme badge calculé, pas statut officiel
- [ ] Action « Valider la levée » (conducteur) validée vs « Clôturer »
- [ ] Ordre d’implémentation Dashboard conducteur en premier confirmé

---

## 10. Annexes

### 10.1 Mapping fichiers socle actuel → cible

| Fichier actuel | Fichier cible |
|---|---|
| `pages/DashboardPage.tsx` | `pages/DashboardConducteurPage.tsx` |
| — | `pages/DashboardDirectionPage.tsx` |
| `pages/ProjectsPage.tsx` | `pages/ChantiersListPage.tsx` |
| `pages/ProjectDetailsPage.tsx` | `pages/ChantierDetailPage.tsx` |
| — | `pages/LoginPage.tsx` |
| — | `pages/ChantierFormPage.tsx` |
| — | `pages/ReservesPage.tsx` |
| — | `pages/PhotosPage.tsx` |
| — | `pages/MobileChefPage.tsx` |
| — | `pages/ReportsPage.tsx` (placeholder) |
| — | `pages/AdminPage.tsx` (placeholder) |

### 10.2 User Stories backlog couvertes

| US | Écran(s) |
|---|---|
| US001–US003 | Liste + Formulaire chantier |
| US004 | Détail — changement statut |
| US005 | Détail — onglet Équipes |
| US006–US007 | Détail avancement + Mobile |
| US008–US009 | Photos |
| US010–US012 | Réserves |
| US013 | Dashboard + alertes |
| US014 | Dashboard direction |
| US015 | Habilitations → guards (pas écran Admin) |

---

*Document produit pour validation métier. Aucun code applicatif généré à ce stade.*
