# Document d’architecture technique (DAT) v1 — Chantiers360

**Version :** 1.4 (Phase K4)  
**Date :** 20/06/2026  
**Statut :** Aligné sur l’implémentation MVP (Phases A–H)  
**Références :** DAA Chantiers360, SPEC-UI-MVP, docs/API.md

---

## 1. Objet

Ce DAT décrit l’**architecture technique réelle** déployée pour le MVP Chantiers360, en vue d’une livraison client (Phase I — industrialisation).

---

## 2. Vue d’ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    Navigateur (HTTPS)                        │
└───────────────────────────┬─────────────────────────────────┘
                            │ :443 / :80
              ┌─────────────▼─────────────┐
              │   Caddy (reverse proxy)    │
              │   TLS — redirect HTTP→HTTPS│
              └───┬─────────────────┬─────┘
                  │ /api/*          │ /*
      ┌───────────▼──────────┐  ┌───▼──────────────────┐
      │ Backend NestJS       │  │ Frontend Nginx       │
      │ /api — port 3000 int │  │ dist Vite — port 80  │
      └───────────┬──────────┘  └──────────────────────┘
                  │ Prisma ORM (réseau internal)
      ┌───────────▼──────────┐
      │ PostgreSQL 16        │
      │ non exposé Internet  │
      └──────────────────────┘

Dev local : Vite :5173 + API :3000 (hors Caddy) — voir docker-compose.yml
```

| Composant | Technologie | Version / remarque |
|-----------|-------------|------------------|
| Frontend | React, TypeScript, Vite, Tailwind, React Router, TanStack Query | Vite 8 ; **prod** : build statique Nginx |
| Backend | NestJS, class-validator, Passport/JWT | Nest 11 ; image multi-stage |
| Reverse proxy | **Caddy 2** | TLS local (`tls internal`) ou Let's Encrypt VPS |
| ORM | Prisma 7 + `@prisma/adapter-pg` + driver `pg` | PostgreSQL |
| Auth | JWT HS256, bcrypt | Expiration `JWT_EXPIRES_IN` (défaut 15m) |
| API doc | `@nestjs/swagger` | Off si `NODE_ENV=production` |
| Tests | Vitest, Jest, Supertest, Playwright | Voir cahier de tests |
| Conteneurs | Docker Compose | **dev** + **prod** (`docker-compose.prod.yml`) |

---

## 3. Déploiement Docker

### 3.1 Développement — `docker-compose.yml`

| Service | Image / build | Rôle |
|---------|---------------|------|
| `postgres` | `postgres:16-alpine` | Base métier (port 5432 exposé pour Prisma local) |
| `backend` | `backend/Dockerfile` (`target: production`) | API NestJS |
| `frontend` | `frontend/Dockerfile` | Serveur dev Vite (:5173) |

```bash
docker compose up --build -d
npm run dev:api && npm run dev:web   # alternative sans Docker FE/BE
```

### 3.2 Production / REC — `docker-compose.prod.yml`

| Service | Réseau | Ports publics | Rôle |
|---------|--------|---------------|------|
| `caddy` | web | 80, 443 | Reverse proxy TLS, `/api` → backend |
| `frontend` | web | — | Nginx + `dist` Vite (`Dockerfile.prod`) |
| `backend` | web + internal | — | NestJS, migrate au boot |
| `postgres` | internal | — | PostgreSQL **non exposé** |

Réseaux : `internal` (isolé), `web` (Caddy ↔ FE/BE).

```bash
cp .env.prod.example .env.prod
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
npm run prod:seed    # REC locale uniquement
npm run prod:verify  # contrôles santé K2
```

Fichiers : `infra/caddy/Caddyfile`, `.env.prod.example`, `scripts/verify-prod-stack.sh`.

**Variables production principales :**

| Variable | Exemple local | Usage |
|----------|---------------|--------|
| `NODE_ENV` | `production` | Contrôles K1 |
| `JWT_SECRET` | ≥ 32 car. | Signature JWT |
| `POSTGRES_PASSWORD` | secret fort | Base (réseau internal) |
| `CORS_ORIGIN` | `https://localhost` | Whitelist CORS |
| `VITE_API_BASE_URL` | `/api` | Build frontend (same-origin) |
| `APP_DOMAIN` | `localhost` | Caddy |
| `TLS_BLOCK` | `tls internal` | Certificat local ; vide sur VPS |

**Variables développement :**

| Variable | Exemple | Usage |
|----------|---------|--------|
| `DATABASE_URL` | `postgresql://…@postgres:5432/chantiers360` | Prisma |
| `JWT_SECRET` | Secret fort ≥ 32 car. en prod | Signature JWT — **obligatoire** |
| `JWT_EXPIRES_IN` | `15m` | Durée token |
| `CORS_ORIGIN` | `http://localhost:5173` | Whitelist CORS |
| `VITE_API_BASE_URL` | `http://localhost:3000/api` | Frontend dev |

---

## 4. Backend — modules implémentés

| Module | Route racine | État MVP |
|--------|--------------|----------|
| Auth | `/api/auth` | ✅ login, me — JWT |
| Users | `/api/users` | ✅ assignables (protégé) |
| Projects (Chantiers) | `/api/chantiers` | ✅ CRUD, statut, historique |
| Onglets chantier | `/api/chantiers/:id/*` | ✅ assignments, progress, reserves, photos |
| Dashboard | `/api/dashboard` | ✅ conducteur, direction |
| Health | `/api/health` | ✅ |
| Roles, Assignments, Issues, Photos, Progress, Alerts (modules) | — | ⚠️ Scaffolding ; logique dans `projects` / `dashboard` |
| History | interne | ✅ via `HistoryService` |

### 4.1 Authentification JWT

- `POST /api/auth/login` — email + mot de passe (bcrypt)
- `GET /api/auth/me` — profil (Bearer obligatoire)
- Guards : **`JwtAuthGuard`** (Bearer JWT obligatoire), **`RolesGuard`** (contrôle `@Roles`), **`UserContextGuard`** (legacy dev/test uniquement)
- Frontend : token + user dans `localStorage` (`chantiers360_auth`) ; header `Authorization: Bearer` via `apiClient`

### 4.2 Protection API (Phase K1)

| Périmètre | Protection |
|-----------|------------|
| Lectures chantiers, onglets, historique | `JwtAuthGuard` + `RolesGuard` |
| `GET /reserves`, `GET /photos` | JWT + rôles Direction / Conducteur / Chef |
| Dashboard | JWT + rôle métier |
| `GET /users/assignable` | JWT + Conducteur |
| Mutations | JWT + rôle selon action |

**Production :** headers legacy `X-User-Id` / `X-User-Email` **désactivés**. JWT Bearer seul.

**Boot :** refusé si `JWT_SECRET` absent ; en production, secret ≥ 32 caractères et hors liste de valeurs interdites.

---

## 5. Base de données PostgreSQL

Schéma Prisma : `backend/prisma/schema.prisma`

Entités principales : `User`, `Role`, `Project`, `Assignment`, `Issue`, `Photo`, `ProgressUpdate`, `Alert`, `HistoryEvent`.

**Seed recette (Phase H) :** 20 chantiers, 7 utilisateurs, données associées — `backend/prisma/recette-seed.ts`.

```bash
cd backend && npm run prisma:deploy && npm run prisma:seed
```

---

## 6. Swagger / OpenAPI

- UI : **http://localhost:3000/api/docs** (développement / recette)
- JSON : **http://localhost:3000/api/docs-json**
- Configuration : `backend/src/bootstrap/app-config.ts` (`configureSwagger`)
- **Production :** désactivé par défaut (`NODE_ENV=production`) — override `ENABLE_SWAGGER=true` pour recette interne
- Tags documentés : `auth`, `dashboard`, `chantiers` (partiel)

---

## 7. CI/CD (Phase K3)

**État :** pipeline **versionné** dans `.github/workflows/`.

| Workflow | Fichier | Rôle |
|----------|---------|------|
| CI | `ci.yml` | Lint*, tests FE/BE/API, builds, Docker smoke |
| Docker Publish | `docker-publish.yml` | Push GHCR (manuel ou tag `v*`) |
| Dependabot | `dependabot.yml` | npm + Docker (hebdomadaire) |

\* Lint advisory (`continue-on-error`) — dette ESLint à traiter.

**Commandes locales alignées :**

```bash
npm run ci:test    # FE Vitest + BE Jest + API Supertest
npm run ci:build   # build FE + prisma generate + build BE
npm run ci:docker  # compose config + build + smoke health
npm run ci:audit   # npm audit high+ (advisory)
```

**Variables CI :** `JWT_SECRET` injecté dans le workflow ; `.env.ci` généré par `scripts/ci-prepare-env.sh`.

**Hors CI K3 :** Playwright E2E (`npm run test:e2e`) — mocks, non bloquant pipeline.

**Déploiement cible :** images GHCR → VPS (Phase L) via `docker compose pull` + `up`.

---

## 8. Sauvegardes & exploitation (Phase K4)

| Élément | Méthode | Fréquence | Rétention |
|---------|---------|-----------|-----------|
| PostgreSQL | `scripts/backup-db.sh` (`npm run ops:backup`) | Quotidienne (cron) | 7 j (REC), 30 j (PROD) |
| Restauration | `scripts/restore-db.sh` | Test hebdo REC | — |
| Monitoring | `scripts/check-health.sh` | 5 min (cron / sonde) | — |
| Logs Docker | `json-file` 5×10 Mo | Automatique | ~50 Mo/service |

**Sauvegarde :**

```bash
npm run ops:backup
# → backup/chantiers360_YYYYMMDD_HHMMSS.sql.gz + .sha256
```

**Restauration (base vide recréée) :**

```bash
npm run ops:restore -- backup/chantiers360_YYYYMMDD_HHMMSS.sql.gz
```

**Healthcheck ops :**

```bash
npm run ops:health
```

Runbook incident : `docs/21-Runbook-Incident.md`. Rapport : `docs/20-Rapport-K4-Exploitation.md`.

**Hors K4 :** sync backup vers stockage externe (S3/OVH) — Phase L.

---

## 9. Supervision

| Niveau | MVP (REC) | Cible PROD |
|--------|-----------|------------|
| Disponibilité API | `scripts/check-health.sh` + sonde externe (UptimeRobot) | Idem + SLA |
| Logs backend | stdout NestJS + rotation Docker K4 | Agrégation (Loki, CloudWatch) |
| Logs frontend | Console navigateur | Sentry / équivalent |
| Métriques | — | Prometheus + Grafana |
| Alertes infra | Cron health + email ops | PagerDuty / email ops |
| BDD | Taille volume, connexions actives | pg_stat, alerting |

**Seuils recommandés REC :** sonde health toutes les 5 min ; alerte si 3 échecs consécutifs (runbook P1).

---

## 10. Sécurité technique (Phase K1)

- Mots de passe hashés (bcrypt, cost 10)
- **JWT** : secret obligatoire au boot ; force minimale en production (32+ car., pas de valeur par défaut)
- **CORS** : whitelist via `CORS_ORIGIN` (plus de `origin: true`)
- **Auth** : JWT Bearer sur toutes les routes métier ; legacy `X-User-Id` réservé dev/test
- **Swagger** : off en production par défaut
- Validation DTO (`ValidationPipe` global)
- Historisation actions sensibles (chantiers, onglets)
- **Non implémenté MVP :** refresh token, rate limiting login, WAF, scan CVE automatisé

---

## 11. Cohérence DAA ↔ implémentation

| Sujet | DAA | Implémentation réelle | Écart |
|-------|-----|----------------------|-------|
| Backend | NestJS ou Express | **NestJS** | ✅ |
| ORM | Prisma recommandé | **Prisma 7** | ✅ |
| Auth logout | `POST /auth/logout` | Absent | ⚠️ Déconnexion client seule |
| Chemins API réserves | `/api/reserves` | **`/api/chantiers/:id/reserves`** | ⚠️ REST nested |
| Reporting | `/api/reporting/*` | **`/api/dashboard/*`** | ⚠️ Renommage |
| Alertes cron | Tâche planifiée | Calcul **à la volée** + seed `Alert` | ⚠️ Pas de cron |
| Upload photo | Fichier binaire | **URL / fileName** | ⚠️ V2 |
| CI/CD | GitHub Actions | **`.github/workflows/ci.yml`** | ✅ K3 |
| Stockage photos | Local / S3 | URLs seedées uniquement | ⚠️ V2 |

---

## 12. Architecture PROD (Phase K2 — implémentée)

```
Internet → Caddy (:443 TLS)
              ├─ /     → Nginx (React static)
              ├─ /api  → NestJS (:3000 interne)
              └─ (postgres :5432 réseau internal uniquement)
```

Post-K2 restant (Phase L / K5) : VPS OVH, DNS, Let's Encrypt réel, sync backup externe, go-live.

**Phase K4 (exploitation) :** scripts backup/restore/health, rotation logs Docker, runbook incident — voir `docs/20-Rapport-K4-Exploitation.md`.

---

## 13. Références techniques

| Document | Chemin |
|----------|--------|
| DAA | `DAA - Chantiers360.txt` |
| API | `docs/API.md` |
| Spec UI | `docs/SPEC-UI-MVP.md` |
| Cahier de tests | `docs/06-Cahier-de-tests.md` |
| Rapport K3 | `docs/19-Rapport-K3-CICD.md` |
| Rapport K4 | `docs/20-Rapport-K4-Exploitation.md` |
| Runbook incident | `docs/21-Runbook-Incident.md` |

---

*DAT v1 — Phase I industrialisation — BatiNova / Chantiers360*
