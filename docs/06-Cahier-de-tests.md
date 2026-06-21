# Cahier de tests — Chantiers360 MVP

**Version :** 1.0  
**Date :** 20/06/2026  
**Statut :** Document vivant — à mettre à jour à chaque fonctionnalité

---

## 1. Règle de travail

> Règle projet permanente (`.cursor/rules/chantiers360-definition-of-done.mdc`) — applicable à chaque fonctionnalité et chaque phase.

À chaque nouvelle fonctionnalité ou correction :

1. Créer ou mettre à jour les **tests automatisés** associés.
2. Ajouter ou mettre à jour une entrée dans ce **cahier de tests**.
3. Exécuter les tests concernés + vérifier le **build**.
4. Indiquer dans la PR / le compte-rendu ce qui a été testé.

### Avant chaque nouvelle phase

Vérifier les impacts sur : règles métier · rôles · navigation · tests existants · cahier de tests.

### Minimum par phase (4 tests obligatoires)

Éviter les tests **cosmétiques** (« le composant rend sans crash »). Chaque phase livre au minimum :

| Type | Exemple | Fichier type |
|------|---------|--------------|
| **1. Règle métier** | RG-001 retard, permissions levée réserve | `*.test.ts` / `*.spec.ts` sur utils ou rules |
| **2. Composant** | Table avec badge calculé, formulaire avec validation | `*.test.tsx` RTL |
| **3. Rôle / accès** | Route interdite, bouton masqué selon rôle | `routeAccess`, `guards`, `chantierPermissions` |
| **4. E2E parcours principal** | Login → écran → action métier de la phase | `e2e/tests/*.spec.ts` |

La synthèse de phase doit référencer les **4 IDs** du cahier. Exception documentée si un type est hors périmètre.

#### Référence phases A–F (déjà couvertes)

| Phase | Règle métier | Composant | Rôle/accès | E2E parcours |
|-------|--------------|-----------|------------|--------------|
| A–B Layout + Dashboard | T-RG-001 | T-UI-001 KpiCard | T-NAV-001 | E2E-DASH-001 |
| C Liste + détail | T-RG-001-UI | T-UI-002 StatusBadge | T-NAV-003 | E2E-NAV-001 |
| D Onglets chantier | T-PERM-001 | T-D-COMP-001 à 014 | T-PERM-001 | E2E-RSV-001 |
| E Auth | T-AUTH-001 | — | T-NAV-001 + guards | E2E-AUTH-001 |
| F Dashboard direction | T-F-RG-001 à 007 | T-F-COMP-001 à 008 | T-F-ROLE-001 | E2E-DASH-004 |
| G Données réelles chantiers | T-G-RG-001 à 004 | T-G-COMP-001 à 003 | T-G-API-001 à 005 | E2E-G-001 |
| G-TABS Onglets fiche chantier | T-G-TABS-RG-001 à 007 | T-G-TABS-COMP-001 | T-G-TABS-API-001 à 006 | E2E-G-TABS-001 |
| G-TABS-FORMS Formulaires onglets | T-G-TABS-RG-001 à 007 | T-G-FORMS-COMP-001 à 004 | T-G-FORMS-API-001 à 004 | E2E-G-FORMS-001 |

### Commandes

| Commande | Périmètre |
|---|---|
| `npm run test --prefix frontend` | Tests unitaires / intégration frontend (Vitest) |
| `npm run test --prefix backend` | Tests unitaires backend (Jest) |
| `npm run test:api --prefix backend` | Tests API Supertest |
| `npm run test:e2e --prefix e2e` | Tests E2E Playwright |
| `npm run test` (racine) | Frontend + backend unitaires |
| `npm run test:all` (racine) | Tous les tests automatisés |
| `npm run build --prefix frontend` | Build production frontend |

---

## 2. Stratégie de tests

| Niveau | Outil | Emplacement |
|---|---|---|
| Unitaire frontend | Vitest + React Testing Library | `frontend/src/**/*.test.ts(x)` |
| Unitaire backend | Jest | `backend/src/**/*.spec.ts` |
| API backend | Jest + Supertest | `backend/test/*.e2e-spec.ts` |
| End-to-end | Playwright | `e2e/tests/*.spec.ts` |

---

## 3. Registre des tests

### 3.1 Règles métier

| ID | Fonctionnalité | Type | Préconditions | Étapes | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|---|---|
| T-RG-001 | RG-001 — retard chantier | Unitaire FE | Date système fixée au 20/06/2025 | Appeler `isChantierLate` avec date passée / future / statut Clôture | Retard = true si date dépassée ET statut ≠ Clôture | ✅ Passé | `frontend/src/utils/chantierRules.test.ts` |
| T-RG-001-BE | RG-001 — retard chantier (backend) | Unitaire BE | Idem | Appeler `isChantierLate` côté API | Même logique que frontend | ✅ Passé | `backend/src/common/rules/chantier.rules.spec.ts` |
| T-RG-001-UI | Badge En retard (table) | Composant | Chantier CHT-003 mocké en retard | Rendre `ChantiersTable` | Badge « En retard » + statut « Réalisation » distincts | ✅ Passé | `frontend/src/components/chantiers/ChantiersTable.test.tsx` |
| T-RG-001-E2E | Badge En retard (UI) | E2E | Connecté conducteur | Aller sur `/chantiers` et `/chantiers/c-3` | Badge « En retard » visible | ✅ Passé | `e2e/tests/chantier-reserves.spec.ts` |

### 3.2 Authentification (Phase E)

| ID | Fonctionnalité | Type | Préconditions | Étapes | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|---|---|
| T-AUTH-001 | Login API — compte valide | Unitaire FE | — | `loginWithCredentials(conducteur@…)` | User + token JWT via POST /auth/login | ✅ Passé | `frontend/src/services/authService.test.ts` |
| T-AUTH-002 | Login API — identifiants invalides | Unitaire FE | — | Mauvais mot de passe (401 API) | `AuthError` levée | ✅ Passé | `frontend/src/services/authService.test.ts` |
| T-AUTH-003 | Persistance session localStorage | Unitaire FE | — | save / load / clear | Session persistée puis effacée | ✅ Passé | `frontend/src/services/authStorage.test.ts` |
| T-AUTH-004 | ProtectedRoute non auth | Intégration FE | Non connecté | Accéder `/dashboard` | Redirection `/login` | ✅ Passé | `frontend/src/routes/guards.test.tsx` |
| T-AUTH-005 | GuestGuard déjà connecté | Intégration FE | Session conducteur | Accéder `/login` | Redirection dashboard | ✅ Passé | `frontend/src/routes/guards.test.tsx` |
| E2E-AUTH-001 | Connexion conducteur | E2E | App démarrée | Login conducteur@batinova.fr | URL `/dashboard` + KPI visibles | ✅ Passé | `e2e/tests/auth-roles.spec.ts` |
| E2E-AUTH-002 | Connexion direction | E2E | — | Login direction@… | URL `/dashboard/direction` | ✅ Passé | `e2e/tests/auth-roles.spec.ts` |
| E2E-AUTH-003 | Connexion assistante | E2E | — | Login assistante@… | URL `/chantiers` | ✅ Passé | `e2e/tests/auth-roles.spec.ts` |
| E2E-AUTH-004 | Connexion chef | E2E | — | Login chef@… | URL `/mobile` | ✅ Passé | `e2e/tests/auth-roles.spec.ts` |
| E2E-AUTH-005 | Erreur login | E2E | — | Mauvais mot de passe | Message d'erreur affiché | ✅ Passé | `e2e/tests/auth-roles.spec.ts` |
| E2E-AUTH-006 | Déconnexion | E2E | Connecté | Clic Déconnexion TopBar | Retour `/login` | ✅ Passé | `e2e/tests/auth-roles.spec.ts` |
| E2E-AUTH-008 | Accès refusé non connecté | E2E | Non connecté | Goto `/dashboard`, `/chantiers` | Redirection `/login` | ✅ Passé | `e2e/tests/auth-roles.spec.ts` |

### 3.2b Authentification JWT (T-API-AUTH)

| ID | Fonctionnalité | Type | Préconditions | Étapes | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|---|---|
| T-API-AUTH-BE-001 | AuthService login valide | Unitaire BE | Prisma mocké | `login()` identifiants seed | Token JWT + profil utilisateur | ✅ Passé | `backend/src/auth/auth.service.spec.ts` |
| T-API-AUTH-BE-002 | AuthService rejette mauvais MDP | Unitaire BE | User seed mocké | `login()` mot de passe erroné | `UnauthorizedException` | ✅ Passé | `backend/src/auth/auth.service.spec.ts` |
| T-API-AUTH-BE-003 | resolveUserFromBearer JWT | Unitaire BE | JWT signé mock | Bearer token valide | RequestUser conducteur | ✅ Passé | `backend/src/auth/auth.service.spec.ts` |
| T-API-AUTH-BE-004 | Fallback X-User-Id | Unitaire BE | Headers legacy | `resolveRequestUser` sans Bearer | RequestUser via header | ✅ Passé | `backend/src/auth/auth.service.spec.ts` |
| T-API-AUTH-001 | POST /api/auth/login OK | Supertest | Prisma mocké | POST credentials valides | 200 + token + user | ✅ Passé | `backend/test/auth.e2e-spec.ts` |
| T-API-AUTH-002 | POST /api/auth/login KO | Supertest | — | POST mauvais mot de passe | 401 | ✅ Passé | `backend/test/auth.e2e-spec.ts` |
| T-API-AUTH-003 | GET /api/auth/me JWT | Supertest | Token valide | GET avec Bearer | 200 profil | ✅ Passé | `backend/test/auth.e2e-spec.ts` |
| T-API-AUTH-004 | GET /api/auth/me sans token | Supertest | — | GET sans Authorization | 401 | ✅ Passé | `backend/test/auth.e2e-spec.ts` |
| T-API-AUTH-005 | UserContextGuard Bearer | Supertest | JWT conducteur | Route test protégée | 200 contexte user | ✅ Passé | `backend/test/auth.e2e-spec.ts` |
| T-API-AUTH-006 | UserContextGuard X-User-Id | Supertest | Header legacy | Route test protégée | 200 rétrocompat | ✅ Passé | `backend/test/auth.e2e-spec.ts` |
| T-API-AUTH-007 | Route protégée sans auth | Supertest | — | GET sans headers | 401 | ✅ Passé | `backend/test/auth.e2e-spec.ts` |

### 3.3 Guards et navigation par rôle

| ID | Fonctionnalité | Type | Préconditions | Étapes | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|---|---|
| T-NAV-001 | Routes autorisées par rôle | Unitaire FE | — | `isRouteAllowed` pour chaque rôle | Matrice SPEC-UI §4.3 respectée | ✅ Passé | `frontend/src/config/routeAccess.test.ts` |
| T-NAV-002 | Nav MVP sans Rapports/Admin/Équipes | Unitaire FE | — | `getNavItemsForRole` tous rôles | 4 entrées max conducteur, pas Rapports | ✅ Passé | `frontend/src/config/navigation.test.ts` |
| T-NAV-003 | RoleGuard conducteur | Intégration FE | Session conducteur | Accès `/dashboard/direction` | Redirection `/dashboard` | ✅ Passé | `frontend/src/routes/guards.test.tsx` |
| T-PERM-001 | Permissions onglets chantier | Unitaire FE | — | `canAssignMember`, `canValidateLevee`, etc. | Droits MVP respectés | ✅ Passé | `frontend/src/utils/chantierPermissions.test.ts` |
| E2E-ROLE-001 | Conducteur bloqué direction | E2E | Connecté conducteur | Goto `/dashboard/direction` | Redirection `/dashboard` | ✅ Passé | `e2e/tests/role-restrictions.spec.ts` |
| E2E-ROLE-002 | Direction bloquée conducteur | E2E | Connecté direction | Goto `/dashboard` | Redirection `/dashboard/direction` | ✅ Passé | `e2e/tests/role-restrictions.spec.ts` |
| E2E-ROLE-003 | Assistante bloquée dashboard | E2E | Connecté assistante | Goto `/dashboard` | Redirection `/chantiers` | ✅ Passé | `e2e/tests/role-restrictions.spec.ts` |
| E2E-ROLE-004 | Chef bloqué dashboard | E2E | Connecté chef | Goto `/dashboard` | Redirection `/mobile` | ✅ Passé | `e2e/tests/role-restrictions.spec.ts` |
| E2E-ROLE-005 | Reports inaccessible | E2E | Connecté conducteur | Goto `/reports` | Redirection route autorisée | ✅ Passé | `e2e/tests/role-restrictions.spec.ts` |

### 3.4 Dashboard et chantiers (Phases B–D)

| ID | Fonctionnalité | Type | Préconditions | Étapes | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|---|---|
| T-UI-001 | KpiCard affichage | Composant | — | Rendre KpiCard | Label, valeur, sous-titre visibles | ✅ Passé | `frontend/src/components/dashboard/KpiCard.test.tsx` |
| T-UI-002 | Badges statut / priorité | Composant | — | Rendre StatusBadge variants | Terminologie Réserve, Réalisation, Levée | ✅ Passé | `frontend/src/components/badges/StatusBadge.test.tsx` |
| E2E-DASH-001 | KPI dashboard conducteur | E2E | Connecté conducteur | Page `/dashboard` | KPI Chantiers actifs, Réserves ouvertes | ✅ Passé | `e2e/tests/dashboard-navigation.spec.ts` |
| E2E-DASH-002 | Chantiers récents dashboard | E2E | Connecté conducteur | Page `/dashboard` | Liste chantiers récents visible | ✅ Passé | `e2e/tests/dashboard-navigation.spec.ts` |
| E2E-DASH-003 | Dashboard direction | E2E | Connecté direction | Login direction | URL `/dashboard/direction` | ✅ Passé | `e2e/tests/dashboard-navigation.spec.ts` |
| E2E-NAV-001 | Dashboard → fiche chantier | E2E | Connecté conducteur | Clic « Résidence Les Oliviers » | URL `/chantiers/c-1`, onglets visibles | ✅ Passé | `e2e/tests/dashboard-navigation.spec.ts` |
| E2E-RSV-001 | Réserves fiche chantier | E2E | Connecté conducteur | `/chantiers/c-3?tab=reserves` | Liste réserves + priorités | ✅ Passé | `e2e/tests/chantier-reserves.spec.ts` |
| E2E-RSV-002 | Réserves dashboard | E2E | Connecté conducteur | `/dashboard` | Section Réserves récentes | ✅ Passé | `e2e/tests/chantier-reserves.spec.ts` |

### 3.4.1 Onglets fiche chantier — composants (Phase D)

| ID | Fonctionnalité | Type | Préconditions | Étapes | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|---|---|
| T-D-COMP-001 | AssignmentsList — affectations | Composant | Fixtures affectations mockées | Rendre `AssignmentsList` | Membres, rôles, dates début/fin visibles | ✅ Passé | `frontend/src/components/chantiers/AssignmentsList.test.tsx` |
| T-D-COMP-002 | AssignmentsList — statuts Actif/Inactif | Composant | Affectations actives et inactives | Rendre `AssignmentsList` | Badges « Actif » et « Inactif » affichés | ✅ Passé | `frontend/src/components/chantiers/AssignmentsList.test.tsx` |
| T-D-COMP-003 | AssignmentsList — bouton Affecter (conducteur) | Composant | `canAssign=true` puis `false` | Vérifier présence bouton | « Affecter un membre » visible conducteur uniquement ; `onAssign` au clic | ✅ Passé | `frontend/src/components/chantiers/AssignmentsList.test.tsx` |
| T-D-COMP-004 | ProgressTimeline — mises à jour | Composant | Fixtures avancement mockées | Rendre `ProgressTimeline` | Date, auteur, commentaire, pourcentage si présent | ✅ Passé | `frontend/src/components/chantiers/ProgressTimeline.test.tsx` |
| T-D-COMP-005 | ProgressTimeline — bouton Ajouter (Conducteur + Chef) | Composant | `canAdd=true` puis `false` | Vérifier présence bouton | « Ajouter une mise à jour » visible Conducteur et Chef de chantier uniquement | ✅ Passé | `frontend/src/components/chantiers/ProgressTimeline.test.tsx` |
| T-D-COMP-006 | ProgressTimeline — action onAdd | Composant | `canAdd=true` | Clic bouton Ajouter | Callback `onAdd` déclenché | ✅ Passé | `frontend/src/components/chantiers/ProgressTimeline.test.tsx` |
| T-D-COMP-007 | ReservesList — statuts et priorités MVP | Composant | Fixtures réserves mockées | Rendre `ReservesList` | Statuts Ouverte / En cours / Levée ; priorités Faible / Moyenne / Haute / Critique ; pas de « Problème » ni « Résolu » | ✅ Passé | `frontend/src/components/chantiers/ReservesList.test.tsx` |
| T-D-COMP-008 | ReservesList — Valider la levée (conducteur) | Composant | `canValidateLevee=true`, réserve En cours | Rendre `ReservesList` | Action « Valider la levée » visible sur ligne En cours | ✅ Passé | `frontend/src/components/chantiers/ReservesList.test.tsx` |
| T-D-COMP-009 | ReservesList — pas de validation sans droit | Composant | `canValidateLevee=false` | Rendre `ReservesList` | Aucun bouton « Valider la levée » | ✅ Passé | `frontend/src/components/chantiers/ReservesList.test.tsx` |
| T-D-COMP-010 | PhotoGallery — catégories MVP | Composant | Fixtures photos mockées | Rendre `PhotoGallery` | Catégories Avant travaux / Pendant travaux / Après travaux visibles | ✅ Passé | `frontend/src/components/chantiers/PhotoGallery.test.tsx` |
| T-D-COMP-011 | PhotoGallery — filtre par catégorie | Composant | Photos multi-catégories | Clic filtre catégorie | Photos filtrées selon catégorie sélectionnée | ✅ Passé | `frontend/src/components/chantiers/PhotoGallery.test.tsx` |
| T-D-COMP-012 | PhotoGallery — bouton Ajouter (Conducteur + Chef) | Composant | `canAdd=true` puis `false` | Vérifier présence bouton | « Ajouter une photo » visible Conducteur et Chef de chantier uniquement | ✅ Passé | `frontend/src/components/chantiers/PhotoGallery.test.tsx` |
| T-D-COMP-013 | HistoryTimeline — lecture seule | Composant | Fixtures historique mockées | Rendre `HistoryTimeline` | Auteur, action, ancienne/nouvelle valeur ; aucun bouton d'action | ✅ Passé | `frontend/src/components/chantiers/HistoryTimeline.test.tsx` |
| T-D-COMP-014 | HistoryTimeline — motif retour arrière | Composant | Entrée avec motif | Rendre `HistoryTimeline` | Bloc « Motif : » affiché quand présent | ✅ Passé | `frontend/src/components/chantiers/HistoryTimeline.test.tsx` |

### 3.4.2 Dashboard direction (Phase F)

| ID | Fonctionnalité | Type | Préconditions | Étapes | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|---|---|
| T-F-RG-001 | Agrégation KPI direction | Unitaire FE | Mocks chantiers + réserves, date 20/06/2025 | `computeDirectionKpis` | Total 8, retard 2, réserves ouvertes 5, critiques 2 | ✅ Passé | `frontend/src/utils/directionDashboard.test.ts` |
| T-F-RG-002 | Chantiers à risque | Unitaire FE | Idem | `getAtRiskChantiers` | c-3 (retard + critiques), c-6 (retard) | ✅ Passé | `frontend/src/utils/directionDashboard.test.ts` |
| T-F-RG-003 | RG-001 exclut Clôture du retard | Unitaire FE | Chantier clôturé date passée | `computeDirectionKpis` / `getAtRiskChantiers` | Clôture non comptée en retard | ✅ Passé | `frontend/src/utils/directionDashboard.test.ts` |
| T-F-RG-004 | Répartition statut / conducteur | Unitaire FE | 8 chantiers mockés | `groupChantiersByStatus` / `groupChantiersByConductor` | 6 statuts MVP, 3 conducteurs ; pas « Exécution » | ✅ Passé | `frontend/src/utils/directionDashboard.test.ts` |
| T-F-RG-005 | Réserve critique ouverte uniquement | Unitaire FE | Réserves mockées | `hasCriticalOpenReserve` | Critique sur c-3, pas sur c-1 | ✅ Passé | `frontend/src/utils/directionDashboard.test.ts` |
| T-F-RG-006 | Filtre tendance mensuelle | Unitaire FE | Série mock 6 mois | `filterMonthlyTrend` | 1 point (mois) ou 3 (trimestre) | ✅ Passé | `frontend/src/utils/directionDashboard.test.ts` |
| T-F-RG-007 | Agrégation budget consolidé | Unitaire FE | Chantiers avec budget | `computeBudgetOverview` | Total, consommé, reste cohérents | ✅ Passé | `frontend/src/utils/directionDashboard.test.ts` |
| T-F-COMP-001 | StatusDistributionChart | Composant | Tranches statut | Rendre composant | Statuts MVP, pas Exécution/Problème | ✅ Passé | `frontend/src/components/dashboard/direction/StatusDistributionChart.test.tsx` |
| T-F-COMP-002 | ConductorDistributionTable | Composant | Lignes conducteur | Rendre composant | Nom, chantiers, retard, réserves | ✅ Passé | `frontend/src/components/dashboard/direction/ConductorDistributionTable.test.tsx` |
| T-F-COMP-003 | MonthlyTrendChart + filtre période | Composant | Données tendance | Clic Mois/Trimestre | Graphique + callback période | ✅ Passé | `frontend/src/components/dashboard/direction/MonthlyTrendChart.test.tsx` |
| T-F-COMP-004 | BudgetOverviewChart | Composant | Budget mocké | Rendre composant | Barre progression + totaux | ✅ Passé | `frontend/src/components/dashboard/direction/BudgetOverviewChart.test.tsx` |
| T-F-COMP-005 | RiskChantiersList — motifs | Composant | Chantiers à risque | Rendre composant | Motifs retard / réserves critiques | ✅ Passé | `frontend/src/components/dashboard/direction/RiskChantiersList.test.tsx` |
| T-F-COMP-006 | RiskChantiersList — drill-down | Composant | Chantier c-3 à risque | Vérifier lien | href `/chantiers/c-3` | ✅ Passé | `frontend/src/components/dashboard/direction/RiskChantiersList.test.tsx` |
| T-F-COMP-007 | DashboardDirectionPage — KPI | Composant | Page complète | Rendre page | 4 KPI + widgets visibles | ✅ Passé | `frontend/src/pages/DashboardDirectionPage.test.tsx` |
| T-F-COMP-008 | DashboardDirectionPage — lecture seule | Composant | Page complète | Vérifier absence boutons | Pas Créer/Modifier/Supprimer/Ajouter ; bandeau RG-012 | ✅ Passé | `frontend/src/pages/DashboardDirectionPage.test.tsx` |
| T-F-ROLE-001 | Route /dashboard/direction | Unitaire FE | Tous rôles | `isRouteAllowed` | Direction seule autorisée | ✅ Passé | `frontend/src/config/routeAccess.test.ts` |
| E2E-DASH-003 | Connexion direction | E2E | Login direction@… | Post-login | URL `/dashboard/direction` | ✅ Passé | `e2e/tests/dashboard-navigation.spec.ts` |
| E2E-DASH-004 | KPI consolidés direction | E2E | Connecté direction | Page dashboard direction | 4 KPI + graphiques + liste à risque | ✅ Passé | `e2e/tests/dashboard-navigation.spec.ts` |
| E2E-DASH-005 | Drill-down chantier à risque | E2E | Connecté direction | Clic Immeuble Haussmann | URL `/chantiers/c-3` | ✅ Passé | `e2e/tests/dashboard-navigation.spec.ts` |
| E2E-DASH-006 | Consultation seule direction | E2E | Connecté direction | Page dashboard direction | Aucun bouton modification | ✅ Passé | `e2e/tests/dashboard-navigation.spec.ts` |

### 3.5 API backend (socle)

| ID | Fonctionnalité | Type | Préconditions | Étapes | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|---|---|
| T-API-001 | Health controller unitaire | Unitaire BE | Module Nest chargé | `getHealth()` | `{ status: 'ok' }` | ✅ Passé | `backend/src/app.controller.spec.ts` |
| T-API-002 | Health endpoint HTTP | Supertest | App Nest initialisée | GET `/api/health` | 200 + status ok | ✅ Passé | `backend/test/health.e2e-spec.ts` |
| T-API-003 | AuthService login + JWT | Unitaire BE | Prisma/Jwt mockés | `login`, `resolveUserFromBearer` | Token signé, profil, guards | ✅ Passé | `backend/src/auth/auth.service.spec.ts` |

### 3.6 Données réelles chantiers — Phase G

| ID | Fonctionnalité | Type | Préconditions | Étapes | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|---|---|
| T-G-RG-001 | RG-DATA-001 — référence CHT-XXX + champs obligatoires | Unitaire BE | — | `validateCreateChantierPayload` avec données valides / invalides | Référence format CHT-XXX ; champs requis rejetés si absents | ✅ Passé | `backend/src/common/rules/chantier-data.rules.spec.ts` |
| T-G-RG-002 | RG-DATA-002 — statut initial Préparation | Unitaire BE | — | `getInitialChantierStatus()` | Retourne `PREPARATION` / « Préparation » | ✅ Passé | `backend/src/common/rules/chantier-data.rules.spec.ts` |
| T-G-RG-003 | RG-DATA-003 — transitions workflow ±1 | Unitaire BE | Statuts MVP ordonnés | `assertValidStatusTransition` avant / après / ±2 | Transition autorisée si delta = ±1 ; rejet sinon | ✅ Passé | `backend/src/common/rules/chantier-data.rules.spec.ts` |
| T-G-RG-004 | RG-DATA-004 — motif retour arrière | Unitaire BE | Transition arrière | `assertStatusChangeReason` sans / avec motif | Motif obligatoire si statut recule | ✅ Passé | `backend/src/common/rules/chantier-data.rules.spec.ts` |
| T-G-API-001 | GET /api/chantiers | Supertest | Service mocké | GET `/api/chantiers` | 200 + liste chantiers | ✅ Passé | `backend/test/chantiers.e2e-spec.ts` |
| T-G-API-002 | POST /api/chantiers | Supertest | Headers utilisateur conducteur | POST avec payload valide | 201 + chantier statut Préparation | ✅ Passé | `backend/test/chantiers.e2e-spec.ts` |
| T-G-API-003 | PATCH /api/chantiers/:id/status | Supertest | Chantier existant | PATCH statut suivant | 200 + nouveau statut | ✅ Passé | `backend/test/chantiers.e2e-spec.ts` |
| T-G-API-004 | POST référence invalide | Supertest | — | POST référence « ABC » | 400 règle métier | ✅ Passé | `backend/test/chantiers.e2e-spec.ts` |
| T-G-API-005 | GET /api/chantiers/:id/history | Supertest | Historique mocké | GET history | 200 + entrées historisées | ✅ Passé | `backend/test/chantiers.e2e-spec.ts` |
| T-G-COMP-001 | ChantierForm — champs création | Composant | Mode create | Rendre `ChantierForm` | Référence, nom, client, adresse, dates visibles | ✅ Passé | `frontend/src/components/chantiers/ChantierForm.test.tsx` |
| T-G-COMP-002 | ChantierForm — soumission | Composant | Formulaire rempli | Clic « Créer le chantier » | Callback `onSubmit` avec payload | ✅ Passé | `frontend/src/components/chantiers/ChantierForm.test.tsx` |
| T-G-COMP-003 | ChangeStatusModal — motif retour | Composant | Transition arrière | Sélection statut antérieur | Motif requis avant confirmation | ✅ Passé | `frontend/src/components/chantiers/ChangeStatusModal.test.tsx` |
| E2E-G-001 | Création chantier via formulaire | E2E | Connecté conducteur, API mockée | `/chantiers/nouveau` → soumettre | Redirection fiche + référence CHT-099 | ✅ Passé | `e2e/tests/chantier-workflow.spec.ts` |
| E2E-G-002 | Changement statut chantier | E2E | Connecté conducteur, fiche c-1 | Modal statut → Réception | Statut « Réception » affiché | ✅ Passé | `e2e/tests/chantier-workflow.spec.ts` |

### 3.7 Onglets fiche chantier — T-G-TABS

| ID | Fonctionnalité | Type | Préconditions | Étapes | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|---|---|
| T-G-TABS-RG-001 | RG-TABS-001 — commentaire avancement | Unitaire BE | — | `validateProgressComment` | Commentaire requis | ✅ Passé | `backend/src/common/rules/chantier-tabs.rules.spec.ts` |
| T-G-TABS-RG-002 | RG-TABS-002 — pourcentage 0–100 | Unitaire BE | — | `validateProgressPercent` | Entier 0–100 ou absent | ✅ Passé | idem |
| T-G-TABS-RG-003 | RG-TABS-003 — champs réserve | Unitaire BE | — | `validateReserveFields` | Titre + priorité requis | ✅ Passé | idem |
| T-G-TABS-RG-004 | RG-TABS-004 — levée depuis En cours | Unitaire BE | — | `validateReserveLeveeTransition` | Rejet si ≠ En cours | ✅ Passé | idem |
| T-G-TABS-RG-005 | RG-TABS-005 — champs photo | Unitaire BE | — | `validatePhotoFields` | fileName + category requis | ✅ Passé | idem |
| T-G-TABS-RG-006 | RG-TABS-006 — champs affectation | Unitaire BE | — | `validateAssignmentFields` | userId + functionLabel requis | ✅ Passé | idem |
| T-G-TABS-RG-007 | Permissions onglets par rôle | Unitaire BE | — | `canAssignMember`, etc. | Matrice MVP respectée | ✅ Passé | idem |
| T-G-TABS-API-001 | GET assignments | Supertest | Service mocké | GET `/assignments` | 200 + liste affectations | ✅ Passé | `backend/test/chantier-tabs.e2e-spec.ts` |
| T-G-TABS-API-002 | GET progress | Supertest | Idem | GET `/progress` | 200 + journal | ✅ Passé | idem |
| T-G-TABS-API-003 | GET reserves | Supertest | Idem | GET `/reserves` | 200 + réserves priorités MVP | ✅ Passé | idem |
| T-G-TABS-API-004 | PATCH levée réserve | Supertest | Conducteur auth | PATCH `…/levee` | 200 statut Levée | ✅ Passé | idem |
| T-G-TABS-API-005 | GET photos | Supertest | Idem | GET `/photos` | 200 + catégories MVP | ✅ Passé | idem |
| T-G-TABS-API-006 | POST progress | Supertest | Conducteur auth | POST commentaire | 201 | ✅ Passé | idem |
| T-G-TABS-COMP-001 | ChantierDetailPage — onglet réserves API | Composant | Mock React Query | Rendre page tab=reserves | Données réserves affichées | ✅ Passé | `frontend/src/pages/ChantierDetailPage.test.tsx` |
| E2E-G-TABS-001 | Onglet équipes | E2E | Connecté conducteur | `/chantiers/c-3?tab=equipes` | Affectations visibles | ✅ Passé | `e2e/tests/chantier-tabs.spec.ts` |
| E2E-G-TABS-002 | Onglet avancement | E2E | Idem | tab=avancement | Journal + pourcentage | ✅ Passé | idem |
| E2E-G-TABS-003 | Validation levée réserve | E2E | Idem | tab=reserves → Valider levée | Statut Levée affiché | ✅ Passé | idem |
| E2E-G-TABS-004 | Onglet photos | E2E | Idem | tab=photos | Photothèque visible | ✅ Passé | idem |

### 3.8 Formulaires onglets — T-G-TABS-FORMS

| ID | Fonctionnalité | Type | Préconditions | Étapes | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|---|---|
| T-G-FORMS-COMP-001 | AssignMemberModal | Composant | Modal ouverte | Soumettre user + fonction | Payload onSubmit | ✅ Passé | `frontend/src/components/chantiers/ChantierTabForms.test.tsx` |
| T-G-FORMS-COMP-002 | AddProgressModal | Composant | Idem | Commentaire + % | Payload onSubmit | ✅ Passé | idem |
| T-G-FORMS-COMP-003 | CreateReserveModal | Composant | Idem | Titre + priorité | Payload onSubmit | ✅ Passé | idem |
| T-G-FORMS-COMP-004 | AddPhotoModal | Composant | Idem | fileName + catégorie | Payload onSubmit | ✅ Passé | idem |
| T-G-FORMS-ROLE-001 | Affectation conducteur seul | Unitaire FE | Rôles MVP | `canAssignMember` | Conducteur oui, chef non | ✅ Passé | `frontend/src/utils/chantierTabFormsPermissions.test.ts` |
| T-G-FORMS-ROLE-002 | Avancement conducteur/chef | Unitaire FE | Idem | `canAddProgressUpdate` | Matrice respectée | ✅ Passé | idem |
| T-G-FORMS-ROLE-003 | Réserve/photo conducteur/chef | Unitaire FE | Idem | `canCreateReserve`, `canAddPhoto` | Matrice respectée | ✅ Passé | idem |
| T-G-FORMS-API-001 | GET users assignable | Supertest | Prisma mocké | GET `/users/assignable` | 200 + liste | ✅ Passé | `backend/test/users.e2e-spec.ts` |
| T-G-FORMS-API-002 | POST assignment | Supertest | Conducteur auth | POST `/assignments` | 201 | ✅ Passé | `backend/test/chantier-tabs.e2e-spec.ts` |
| T-G-FORMS-API-003 | POST réserve | Supertest | Conducteur auth | POST `/reserves` | 201 | ✅ Passé | idem |
| T-G-FORMS-API-004 | POST photo | Supertest | Conducteur auth | POST `/photos` | 201 | ✅ Passé | idem |
| E2E-G-FORMS-001 | Création affectation | E2E | Connecté conducteur | Modal équipes | Collaborateur visible | ✅ Passé | `e2e/tests/chantier-tab-forms.spec.ts` |
| E2E-G-FORMS-002 | Création avancement | E2E | Idem | Modal avancement | Commentaire affiché | ✅ Passé | idem |
| E2E-G-FORMS-003 | Création réserve | E2E | Idem | Modal réserves | Réserve Ouverte | ✅ Passé | idem |
| E2E-G-FORMS-004 | Ajout photo | E2E | Connecté chef | Modal photos | fileName visible | ✅ Passé | idem |
| E2E-G-FORMS-005 | Chef sans bouton affecter | E2E | Connecté chef | Onglet équipes | Pas de bouton Affecter | ✅ Passé | idem |

**Documentation API :** `docs/API.md` (§ T-G-TABS-FORMS).

### 3.9 Release 1.1-A — Upload photos (EVOL-001)

| ID | Fonctionnalité | Type | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|
| TST-R11-A-01 | Validation MIME JPG/PNG | Unitaire BE | Accepte JPEG/PNG, rejette PDF | ✅ Passé | `backend/src/storage/storage.service.spec.ts` |
| TST-R11-A-02 | Taille max 10 Mo | Unitaire BE | Rejet > 10 Mo | ✅ Passé | idem |
| TST-R11-A-03 | POST multipart 201 | Supertest | Upload délégué PhotosService | ✅ Passé | `backend/test/photos-upload.api.spec.ts` |
| TST-R11-A-04 | Type invalide 415 | Supertest | UnsupportedMediaType | ✅ Passé | idem |
| TST-R11-A-05 | Taille excessive 413 | Supertest | PayloadTooLarge | ✅ Passé | idem |
| TST-R11-A-06 | DELETE photo 204 | Supertest | Soft delete | ✅ Passé | `backend/test/photos-delete.api.spec.ts` |
| TST-R11-A-07 | Historique suppression | Supertest | deletePhoto invoqué | ✅ Passé | idem |
| TST-R11-A-08 | AddPhotoModal upload | Composant FE | files + category | ✅ Passé | `frontend/src/components/chantiers/AddPhotoModal.test.tsx` |
| TST-R11-A-09 | Parcours E2E upload | E2E | Photo visible galerie | ✅ Passé | `e2e/tests/photos-upload.spec.ts` |

**Note E2E :** les parcours Phase G et les écrans consommant l’API chantiers utilisent `e2e/helpers/mockChantiersApi.ts` (fixture Playwright) pour rester déterministes sans PostgreSQL.

### 3.10 Release 1.1-B — Planning ouvriers (EVOL-002)

| ID | Fonctionnalité | Type | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|
| TST-EVOL-002-01 | Détection chevauchement | Unitaire BE | Conflit détecté | ✅ Passé | `backend/src/common/rules/planning-conflicts.rules.spec.ts` |
| TST-EVOL-002-02 | CANCELLED ignoré | Unitaire BE | Pas de conflit | ✅ Passé | idem |
| TST-EVOL-002-03 | CRUD créneaux API | Supertest | GET/POST/PUT/DELETE | ✅ Passé | `backend/test/planning.api.spec.ts` |
| TST-EVOL-002-04 | HTTP 409 conflit | Supertest | Message chantier + horaire | ✅ Passé | idem |
| TST-EVOL-002-05 | CRUD ouvriers API | Supertest | GET/POST/PATCH | ✅ Passé | `backend/test/workers.api.spec.ts` |
| TST-EVOL-002-06 | KPI occupation | Unitaire + API | % / 35 h semaine | ✅ Passé | rules spec + `planning.api.spec.ts` |
| TST-EVOL-002-07 | Filtres + calendrier | Composant FE | Semaine + filtres | ✅ Passé | `PlanningFilters.test.tsx`, `PlanningCalendar.test.tsx` |
| TST-EVOL-002-08 | Parcours E2E planning | E2E | Création, conflit, filtres, rôles | ✅ Passé | `e2e/tests/planning-affectation.spec.ts` |
| TST-EVOL-002-09 | RG-PLA-04 — périmètre chantiers planning | Unitaire FE + BE + E2E | Conducteur : ses chantiers ; chef : affectés ; direction/assistante : tous ; reset filtre | ✅ Passé | `planningChantiers.test.ts`, `planning.service.spec.ts`, E2E-EVOL-002-05 |

**Note E2E planning :** mock `e2e/helpers/mockPlanningApi.ts` (fixture Playwright).

### 3.11 Release 1.1-C — Budget & ressources (EVOL-003)

| ID | Fonctionnalité | Type | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|
| TST-EVOL-003-01 | Calcul budget restant (RG-BUD-04) | Unitaire BE | restant = enveloppe − VALIDATED | ✅ Passé | `backend/src/budget/rules/budget-summary.rules.spec.ts` |
| TST-EVOL-003-02 | Alertes 80 % / 100 % (RG-BUD-02/03) | Unitaire BE | Idempotence par seuil | ✅ Passé | idem |
| TST-EVOL-003-03 | CRUD dépenses API | Supertest | POST/GET + RG-BUD-01 | ✅ Passé | `backend/test/budget.api.spec.ts` |
| TST-EVOL-003-04 | GET budget/summary | Supertest | Synthèse + alertes | ✅ Passé | idem |
| TST-EVOL-003-05 | Dashboard budget réel | Unitaire BE | budgetSpent = Σ VALIDATED | ✅ Passé | `backend/src/dashboard/dashboard.helpers.spec.ts` |
| TST-EVOL-003-06 | BudgetSummaryCard | Composant FE | Enveloppe, consommé, badges | ✅ Passé | `frontend/src/components/budget/BudgetSummaryCard.test.tsx` |
| TST-EVOL-003-07 | Parcours E2E alertes budget | E2E | Onglet, saisie, alerte 80 %, chef RO | ✅ Passé | `e2e/tests/budget-expense-alert.spec.ts` |

**Cas VALIDATED only (RG-BUD-05) :** DRAFT et CANCELLED exclus des agrégats — couvert par rules spec + seed recette CHT-001.

**Note E2E budget :** mock `e2e/helpers/mockBudgetApi.ts` (fixture Playwright).

---

## 4. Comptes de test

| Email | Mot de passe | Rôle |
|---|---|---|
| direction@batinova.fr | demo123 | Direction |
| conducteur@batinova.fr | demo123 | Conducteur de travaux |
| assistante@batinova.fr | demo123 | Assistante administrative |
| chef@batinova.fr | demo123 | Chef de chantier |
| sophie.martin@batinova.fr | demo123 | Conducteur de travaux |
| luc.bernard@batinova.fr | demo123 | Conducteur de travaux |

### 3.8 Phase H — Dashboards API + recette (T-H)

| ID | Fonctionnalité | Type | Préconditions | Étapes | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|---|---|
| T-H-RG-001 | RG-001 retard backend | Unitaire BE | Date dépassée | `isProjectLate` | true si actif | ✅ Passé | `backend/src/common/rules/chantier-late.rules.spec.ts` |
| T-H-RG-005 | KPI conducteur agrégés | Unitaire BE | Projet + issues mock | `computeConducteurKpis` | 4 KPI corrects | ✅ Passé | `backend/src/dashboard/dashboard.helpers.spec.ts` |
| T-H-RG-006 | Alertes dynamiques | Unitaire BE | Retard + critique | `buildAlertsFromData` | 2 types alertes | ✅ Passé | idem |
| T-H-API-001 | GET dashboard conducteur | Supertest | JWT conducteur | GET `/api/dashboard/conducteur` | 200 + KPI | ✅ Passé | `backend/test/dashboard.e2e-spec.ts` |
| T-H-API-002 | GET dashboard direction | Supertest | JWT direction | GET `/api/dashboard/direction` | 200 consolidé | ✅ Passé | idem |
| T-H-SWAGGER-001 | OpenAPI JSON | Supertest | App + Swagger | GET docs-json | auth + dashboard paths | ✅ Passé | `backend/test/swagger.e2e-spec.ts` |
| T-H-FE-001 | Dashboard direction API | Composant | Query mockée | Render page | KPI + charts visibles | ✅ Passé | `frontend/src/pages/DashboardDirectionPage.test.tsx` |
| E2E-DASH-001 à 006 | Navigation dashboards | E2E | Mocks API dashboard | Login + navigation | KPI et drill-down | ✅ Passé | `e2e/tests/dashboard-navigation.spec.ts` |

---

## 5. Tests à ajouter (backlog)

| ID | Fonctionnalité | Priorité |
|---|---|---|
| T-MOBILE-001 | Vue mobile chef de chantier | P4 |
| T-UPLOAD-001 | Upload binaire photos (stockage fichiers) | P3 |

---

## 6. Historique des exécutions

| Date | Périmètre | Résultat | Exécuté par |
|---|---|---|---|
| 20/06/2026 | Mise en place stratégie tests Phases A–E | ✅ 33 FE + 5 BE + 23 E2E | Agent |
| 20/06/2026 | Dette tests composants Phase D (T-D-COMP-001 à 014) | ✅ 47 FE (15 fichiers) + build OK | Agent |
| 20/06/2026 | Phase F Dashboard direction (T-F-RG/COMP/ROLE + E2E-DASH-003 à 006) | ✅ 63 FE + 26 E2E + build OK | Agent |
| 20/06/2026 | Phase G Données réelles chantiers (T-G-RG/API/COMP + E2E-G-001/002) | ✅ 66 FE + 9 BE + 6 API + 28 E2E + build OK | Agent |
| 20/06/2026 | T-G-TABS onglets fiche chantier (RG/API/COMP + E2E-G-TABS-001 à 004) | ✅ 67 FE + 16 BE + 12 API + 32 E2E + build OK | Agent |
| 20/06/2026 | T-G-TABS-FORMS modales écriture (COMP/ROLE/API + E2E-G-FORMS-001 à 005) | ✅ 74 FE + 16 BE + 17 API + 37 E2E + build OK | Agent |
| 20/06/2026 | T-API-AUTH JWT réel (login/me, guards, E2E-AUTH-008) | ✅ 74 FE + 22 BE + 23 API + 38 E2E + build OK | Agent |
| 20/06/2026 | Phase H Dashboards API + Swagger + seed recette 20 chantiers | ✅ 74 FE + 28 BE + 26 API + 38 E2E + build OK | Agent |
| 20/06/2026 | Phase I Industrialisation (DAT, guides, dossier recette, roadmap, chiffrage) | ✅ Docs 08–13 | Agent |
| 20/06/2026 | Phase J Complétude MVP (workflow réserves, clôture, vues globales, mobile) | ✅ 76 FE + 30 BE + 27 API + build OK | Agent |
| 20/06/2026 | Phase K0 Audit Production Readiness | ✅ Doc 15 | Agent |
| 20/06/2026 | Phase K1 Sécurité applicative (auth, JWT, CORS, Swagger) | ✅ 76 FE + 38 BE + 37 API + 41 E2E + Doc 16 | Agent |
| 20/06/2026 | Phase K2 Packaging prod (Caddy, Nginx, compose.prod, verify) | ✅ Stack prod locale validée + Doc 18 | Agent |
| 20/06/2026 | Phase K3 CI/CD (GitHub Actions, GHCR, Dependabot) | ✅ Workflows + scripts ci:* + Doc 19 | Agent |

### 3.13 CI/CD — Phase K3

| ID | Fonctionnalité | Type | Préconditions | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|---|
| T-K3-CI-001 | CI frontend test+build | GitHub Actions | push/PR | Job vert | ✅ Configuré | `.github/workflows/ci.yml` |
| T-K3-CI-002 | CI backend test+API+build | GitHub Actions | idem | Job vert | ✅ Configuré | idem |
| T-K3-CI-003 | CI Docker build+smoke | GitHub Actions | Docker runner | health OK | ✅ Configuré | `scripts/ci-docker-smoke.sh` |
| T-K3-CI-004 | npm audit advisory | GitHub Actions | — | rapport audit | ✅ Configuré | idem |
| T-K3-CI-005 | Commandes locales ci:* | Script | Node 22 | aligné CI | ✅ Passé | `package.json` |
| T-K3-CI-006 | Dependabot config | Config | — | PR deps hebdo | ✅ Configuré | `.github/dependabot.yml` |
| T-K3-CI-007 | GHCR publish workflow | GitHub Actions | workflow_dispatch | images taguées | ✅ Configuré | `docker-publish.yml` |

**Documentation :** `docs/19-Rapport-K3-CICD.md`

---

### 3.12 Packaging production — Phase K2

| ID | Fonctionnalité | Type | Préconditions | Résultat attendu | Statut | Fichier test |
| T-K2-DOCKER-002 | Stack complète healthy | Docker | `up -d` | 4 services healthy | ✅ Passé | idem |
| T-K2-DOCKER-003 | Health API via Caddy | Script | Stack up | `/api/health` 200 | ✅ Passé | `scripts/verify-prod-stack.sh` |
| T-K2-DOCKER-004 | Login JWT prod | Script | Seed REC | token retourné | ✅ Passé | idem |
| T-K2-DOCKER-005 | Swagger off prod | Script | NODE_ENV=production | docs-json 404 | ✅ Passé | idem |
| T-K2-DOCKER-006 | SPA React Router refresh | Script | Stack up | `/chantiers` 200 HTML | ✅ Passé | idem |
| T-K2-DOCKER-007 | Postgres non mappé prod | Docker | compose prod | pas de `5432:5432` | ✅ Passé | `docker compose ps` |
| T-K2-DOCKER-008 | Prisma migrate deploy | Docker | Boot backend | migrations appliquées | ✅ Passé | logs backend |

**Documentation :** `docs/18-Rapport-K2-Packaging-Production.md`

---

### 3.11 Sécurité applicative — Phase K1

| ID | Fonctionnalité | Type | Préconditions | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|---|
| T-K1-RG-001 | JWT_SECRET obligatoire | Unitaire BE | secret absent | Erreur boot | ✅ Passé | `backend/src/config/jwt-secret.validation.spec.ts` |
| T-K1-RG-002 | Secret faible refusé en prod | Unitaire BE | NODE_ENV=production | Erreur | ✅ Passé | idem |
| T-K1-RG-004 | Legacy auth off en prod | Unitaire BE | NODE_ENV=production | isLegacyAuthAllowed=false | ✅ Passé | idem |
| T-K1-SEC-001 à 008 | Routes sans JWT → 401 | Supertest | Pas de Bearer | 401 | ✅ Passé | `backend/test/security.e2e-spec.ts` |
| T-K1-SEC-009 | X-User-Id refusé en prod | Supertest | NODE_ENV=production | 401 | ✅ Passé | `backend/test/auth.e2e-spec.ts` |
| T-K1-SWAGGER-001 | Swagger off en prod | Supertest | NODE_ENV=production | 404 docs-json | ✅ Passé | `backend/test/swagger.e2e-spec.ts` |
| — | RolesGuard | Unitaire BE | Rôle manquant | 403 | ✅ Passé | `backend/src/auth/guards/roles.guard.spec.ts` |

**Documentation :** `docs/16-Rapport-K1-Securite-Applicative.md`

---

### 3.10 Complétude MVP — Phase J

| ID | Fonctionnalité | Type | Préconditions | Résultat attendu | Statut | Fichier test |
|---|---|---|---|---|---|---|
| T-J-RG-001 | RG-TABS-008 — prise en charge depuis Ouverte | Unitaire BE | — | Rejet si ≠ Ouverte | ✅ Passé | `backend/src/common/rules/chantier-tabs.rules.spec.ts` |
| T-J-RG-002 | REC-013 — clôture interdite si réserves ouvertes | Unitaire BE | openReservesCount > 0 | Erreur REC-013 | ✅ Passé | `backend/src/common/rules/chantier-data.rules.spec.ts` |
| T-J-API-001 | PATCH prise en charge réserve | Supertest | Réserve Ouverte | 200 + En cours + takenAt | ✅ Passé | `backend/test/chantier-tabs.e2e-spec.ts` |
| T-J-COMP-001 | ReservesList — Prendre en charge | Composant | Réserve Ouverte | Bouton visible + callback | ✅ Passé | `frontend/src/components/chantiers/ReservesList.test.tsx` |
| T-J-COMP-002 | ChangeStatusModal — blocage Clôture | Composant | openReservesCount > 0 | Option Clôture désactivée | ✅ Passé | `frontend/src/components/chantiers/ChangeStatusModal.test.tsx` |
| E2E-J-RSV-001 | Vue globale /reserves | E2E | Conducteur | Filtres + liste réserves | ✅ Passé | `e2e/tests/phase-j-global.spec.ts` |
| E2E-J-PHO-001 | Vue globale /photos | E2E | Conducteur | Galerie + filtres | ✅ Passé | idem |
| E2E-J-MOB-001 | Vue mobile chef | E2E | Chef | Chantiers + actions terrain | ✅ Passé | idem |

---

*Ce document est la référence unique du cahier de tests MVP. Toute nouvelle entrée doit suivre le format du §3.*
