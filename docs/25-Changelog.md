# Changelog — Chantiers360

Toutes les évolutions notables de Chantiers360 sont documentées dans ce fichier.

Le format est inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)  
et le projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

**Processus évolutions RUN :** `docs/23-Processus-Gestion-Evolutions.md`  
**Fiches évolutions :** `evolutions/EVOL-NNN-*.md`

---

## [Unreleased]

_Entrees en cours de developpement._

---

## [1.1.0] - 2026-06-21

**Date de release :** 21/06/2026  
**Statut :** Release 1.1 livrée — lots A/B/C **Recette OK** (gates A, B, C validés)  
**Rapport lot A :** `docs/rapports/26-Rapport-Lot-1.1-A.md` — **Gate A ✅**  
**Rapport lot B :** `docs/rapports/27-Rapport-Lot-1.1-B.md` — **Gate B ✅**  
**Rapport lot C :** `docs/rapports/28-Rapport-Lot-1.1-C.md` — **Gate C ✅**  
**Recette automatisée :** `docs/rapports/recette-auto/recette-auto-2026-06-21.md` — **36/36 ✅**

### Added — lot 1.1-A (EVOL-001) ✅

- Upload reel JPG/JPEG/PNG (10 Mo, 10 fichiers) — `POST /chantiers/:id/photos/upload`
- Stream authentifie — `GET /photos/:id/file`
- Suppression soft delete — `DELETE /photos/:id`
- Volume Docker `uploads_data`, variables `UPLOAD_DIR` / `UPLOAD_MAX_SIZE`
- Script `npm run ops:backup:uploads`

### Changed — lot 1.1-B (EVOL-002)

- **RG-PLA-04** — filtre et modale planning limités au périmètre chantier autorisé (aligné API)
- Boutons planning : classes `brand` (correction affichage « Enregistrer »)

### Added — lot 1.1-B (EVOL-002) ✅

- Référentiel **Ouvriers** (`Worker`) distinct des utilisateurs (ADR-001)
- Créneaux **WorkerSchedule** — détection conflits HTTP 409
- Page `/planning` — vues semaine / mois, filtres, KPI occupation
- Endpoints `/workers`, `/planning`, `/planning/kpi/occupation`
- Migration `0004_worker_planning`
- Historisation « Affectation / Modification / Annulation planning »

### Added — lot 1.1-C (EVOL-003) ✅

- **ProjectResource** / **ProjectExpense** — CRUD ressources et dépenses chantier
- **ExpenseStatus** — agrégats sur `VALIDATED` uniquement (RG-BUD-05)
- Onglet **Budget** fiche chantier — synthèse, ressources, dépenses
- Alertes automatiques `BUDGET_80` / `BUDGET_100`
- Dashboard direction — KPI budget réel + chantiers > 80 % / > 100 %
- Migrations `0005_budget_resources_expenses`, `0006_alert_budget_types`
- Endpoints `/chantiers/:id/resources`, `/expenses`, `/budget/summary`

### Added — recette MOA assistée

- Framework recette automatisée — `npm run test:recette` (stack réelle, 36 scénarios)
- Matrice d'automatisation, cahier MOA manuel, processus RUN (`docs/23`, `docs/31`–`34`)

### Added — lots 1.1-B/C (prévu)

- ~~**EVOL-003** — Budget & ressources chantier — lot 1.1-C~~ → livré lot 1.1-C ✅

### Changed — lot 1.1-A

- `AddPhotoModal` — upload natif (remplace saisie URL MVP)
- Galeries chantier et globale — aperçu API + suppression

### Changed — lot 1.1-C

- **Breaking :** `budgetSpent` basé sur `SUM(ProjectExpense.amount) WHERE status = VALIDATED` (remplace `% avancement × budget` MVP)
- Dashboard direction — `budget.totalSpent`, `chantiersOver80`, `chantiersOver100`
- Onglet Budget — messages métier en cas d'accès refusé (403) : *Accès réservé au conducteur référent* / *équipes affectées*

### Fixed

- Messages métier accès budget refusé (403) — conducteur non référent
- RG-PLA-04 — périmètre planning chantiers conducteur
- Boutons planning — affichage « Enregistrer » (classes brand)

---

## [1.0.0] — 2026-06-21

### Added
- MVP Chantiers360 — gestion chantiers, réserves, photos, dashboards Conducteur / Direction
- Authentification JWT, guards rôles, historisation
- Stack production Docker (Caddy, Nginx, NestJS, PostgreSQL)
- CI GitHub Actions (tests, build, smoke Docker)
- Scripts exploitation K4 : backup, restore, healthcheck
- Runbook incident et point d’arrêt go-live (L1→L5)

### Security
- JWT obligatoire sur routes métier (Phase K1)
- CORS restreint, Swagger désactivé en production
- PostgreSQL non exposé sur réseau public (compose prod)

---

## Historique des versions (référence)

| Version | Date | Jalons principaux | Tag Git |
|---------|------|-------------------|---------|
| 1.0.0 | 21/06/2026 | MVP + K1–K4 livrés · RUN cadre méthodo | _à taguer au go-live_ |
| 1.1.0 | 21/06/2026 | EVOL-001/002/003 Release 1.1 · recette MOA assistée | `v1.1.0` |
| 1.2.0 | _backlog_ | Notifications, commentaires, reporting | _—_ |
| 2.0.0 | _vision_ | Portail client, mobile, multi-tenant | _—_ |

---

## Convention d’écriture des entrées

```markdown
### Added | Changed | Deprecated | Removed | Fixed | Security
- EVOL-NNN — Description courte utilisateur ([#123](PR)) — _fiche evolutions/..._
```

| Section | Usage |
|---------|--------|
| **Added** | Nouvelle fonctionnalité |
| **Changed** | Évolution comportement existant |
| **Deprecated** | Fonctionnalité maintenue mais à retirer |
| **Removed** | Fonctionnalité supprimée |
| **Fixed** | Correction de bug |
| **Security** | Correctif ou durcissement sécurité |

---

[Unreleased]: https://github.com/mcleland147/chantiers360/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/mcleland147/chantiers360/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/mcleland147/chantiers360/releases/tag/v1.0.0
