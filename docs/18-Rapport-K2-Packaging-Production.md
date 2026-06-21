# Rapport Phase K2 — Packaging Production & Reverse Proxy

**Projet :** Chantiers360 / BatiNova  
**Date :** 20/06/2026  
**Statut :** ✅ Livré — stack PROD exécutable localement  
**Prérequis :** Phase K1 (sécurité applicative) ✅

---

## 1. Objectif

Produire une stack Docker **production / REC** distincte du développement, avec reverse proxy Caddy (HTTPS), frontend Nginx statique, backend NestJS durci, PostgreSQL isolé — **sans déploiement VPS** (préparation K3 / Phase L).

---

## 2. Livrables

| Fichier | Rôle |
|---------|------|
| `frontend/Dockerfile.prod` | Build Vite + Nginx |
| `frontend/nginx/default.conf` | SPA React Router + cache assets |
| `backend/Dockerfile` | Multi-stage production + target `development` |
| `backend/docker-entrypoint.sh` | `prisma migrate deploy` au démarrage |
| `docker-compose.prod.yml` | Stack prod (réseaux `internal` / `web`) |
| `infra/caddy/Caddyfile` | HTTPS, redirect HTTP, proxy `/api` |
| `.env.prod.example` | Variables production |
| `frontend/.dockerignore`, `backend/.dockerignore` | Contexte Docker optimisé |
| `scripts/verify-prod-stack.sh` | Validation automatisée K2 |

---

## 3. Architecture déployée

```
Internet / navigateur
        │
   :80 / :443  (seuls ports publics)
        │
     Caddy  ── /api/* ──► backend:3000 (NestJS)
        │
        └── /* ──► frontend:80 (Nginx + dist Vite)
                        │
              backend ──┴── postgres:5432
              (réseau internal — non routable Internet)
```

| Service | Réseau | Port hôte | Healthcheck |
|---------|--------|-----------|-------------|
| caddy | web | 80, 443 | `caddy validate` |
| frontend | web | — | wget `/` |
| backend | web + internal | — | curl `/api/health` |
| postgres | internal | — | `pg_isready` |

---

## 4. Écarts K0 adressés

| ID | Écart | Statut K2 |
|----|-------|-----------|
| **K0-C04** | PostgreSQL exposé | ✅ Pas de mapping port en prod |
| **K0-C05** | Frontend Vite dev en Docker | ✅ `Dockerfile.prod` + Nginx |
| **K0-C01** | Pas de HTTPS | ✅ Caddy TLS (`tls internal` local) |
| **K0-I09** | `VITE_API_BASE_URL` incorrect | ✅ Build ARG `/api` (same-origin) |
| **K0-I10** | Pas healthcheck / restart | ✅ `unless-stopped` + healthchecks |

---

## 5. Procédure — build & démarrage production locale

### 5.1 Préparation

```bash
cp .env.prod.example .env.prod
# Éditer JWT_SECRET, POSTGRES_PASSWORD (≥ 32 caractères)
```

### 5.2 Build & démarrage

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
```

Ou :

```bash
npm run prod:up
```

### 5.3 Migrations Prisma

Exécutées **automatiquement** au démarrage backend (`docker-entrypoint.sh`).

Manuel si besoin :

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod exec backend npx prisma migrate deploy
```

### 5.4 Seed REC (local uniquement)

```bash
npm run prod:seed
# ou
docker compose -f docker-compose.prod.yml --env-file .env.prod --profile seed run --rm seed
```

**Ne jamais seed en PROD client** (comptes `demo123`).

### 5.5 Vérification santé

| URL | Attendu |
|-----|---------|
| https://localhost/api/health | `{"status":"ok",…}` |
| https://localhost/ | Application React |
| https://localhost/chantiers | SPA (refresh OK) |
| https://localhost/api/docs-json | **404** (Swagger off) |

Script automatisé :

```bash
npm run prod:verify
```

### 5.6 Arrêt

```bash
npm run prod:down
```

---

## 6. Validation technique (20/06/2026)

| # | Contrôle | Résultat |
|---|----------|----------|
| 1 | Build images Docker | ✅ |
| 2 | Démarrage stack complète | ✅ |
| 3 | Healthchecks (4 services healthy) | ✅ |
| 4 | Accès API via Caddy `/api/health` | ✅ |
| 5 | Login JWT (`conducteur@batinova.fr`) | ✅ |
| 6 | PostgreSQL non mappé sur l'hôte (prod) | ✅ |
| 7 | React Router refresh `/chantiers` | ✅ |
| 8 | Swagger désactivé (404) | ✅ |

---

## 7. Configuration VPS (Phase L — hors K2)

Pour OVH / domaine réel, adapter `.env.prod` :

```bash
APP_DOMAIN=app.votredomaine.fr
TLS_BLOCK=                    # supprimer tls internal
CADDY_GLOBAL_OPTIONS=email admin@votredomaine.fr
CORS_ORIGIN=https://app.votredomaine.fr
VITE_API_BASE_URL=/api
```

Caddy obtient alors un certificat Let's Encrypt automatiquement.

---

## 8. Corrections appliquées pendant K2

| Problème | Correction |
|----------|------------|
| `prisma migrate deploy` sans URL | Copie `prisma.config.ts` + dotenv optionnel |
| `Cannot find module dist/main.js` | CMD → `node dist/src/main.js` |
| Seed ts-node en image prod | Profil Compose `seed` (image development) |

---

## 9. Prochaines étapes

| Phase | Contenu |
|-------|---------|
| **K3** | CI/CD, build images, registry |
| **L** | VPS OVH, DNS, SSL réel, firewall |
| **K4** | Backup automatisé, monitoring |

---

*Rapport K2 — BatiNova — 20/06/2026*
