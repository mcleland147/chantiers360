# Chantiers360 - Socle technique MVP

Socle full stack conforme aux arbitrages fonctionnels valides :
- Frontend : React, TypeScript, Vite, Tailwind CSS, React Router, React Query
- Backend : Node.js, NestJS
- Base : PostgreSQL
- ORM : Prisma
- Authentification : JWT
- Conteneurisation : Docker + Docker Compose
- Tests : Vitest (frontend), Jest (backend), Playwright (E2E)

## Prerequis

- Node.js 22+
- npm 11+
- Docker + Docker Compose

## Installation locale

1. Copier les variables d'environnement :

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

2. Installer les dependances :

```bash
cd frontend && npm install
cd ../backend && npm install
```

3. Generer le client Prisma et la migration initiale :

```bash
cd backend
npm run prisma:generate
```

Phase K2 — Packaging production :


```bash
cp .env.prod.example .env.prod
npm run prod:up
npm run prod:seed      # première fois REC locale
npm run prod:verify
```

- Application : https://localhost
- API : https://localhost/api

## Lancement sans Docker

Terminal 1:

```bash
cd backend
npm run start:dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

## Structure

- `frontend/src/components`
- `frontend/src/pages`
- `frontend/src/layouts`
- `frontend/src/services`
- `frontend/src/hooks`
- `frontend/src/routes`
- `frontend/src/types`
- `frontend/src/utils`

- `backend/src/auth`
- `backend/src/users`
- `backend/src/roles`
- `backend/src/projects`
- `backend/src/assignments`
- `backend/src/issues`
- `backend/src/photos`
- `backend/src/progress`
- `backend/src/alerts`
- `backend/src/dashboard`
- `backend/src/history`
- `backend/src/common`

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/SPEC-UI-MVP.md`](docs/SPEC-UI-MVP.md) | Spécification UI |
| [`docs/API.md`](docs/API.md) | Référence API |
| [`docs/06-Cahier-de-tests.md`](docs/06-Cahier-de-tests.md) | Cahier de tests automatisés |
| [`docs/07-Cahier-Recette-Metier.md`](docs/07-Cahier-Recette-Metier.md) | Cas de recette métier (REC-001–015) |
| [`docs/08-DAT-v1.md`](docs/08-DAT-v1.md) | Architecture technique v1 |
| [`docs/09-Guide-Utilisateur.md`](docs/09-Guide-Utilisateur.md) | Guide par rôle |
| [`docs/10-Guide-Exploitation.md`](docs/10-Guide-Exploitation.md) | Démarrage, sauvegarde, logs |
| [`docs/11-Dossier-Recette-Synthese.md`](docs/11-Dossier-Recette-Synthese.md) | Synthèse couverture + tests |
| [`docs/12-Roadmap-V2.md`](docs/12-Roadmap-V2.md) | Roadmap post-MVP |
| [`docs/13-Chiffrage.md`](docs/13-Chiffrage.md) | Efforts et coûts |
| [`docs/14-Rapport-Cloture-MVP.md`](docs/14-Rapport-Cloture-MVP.md) | Rapport clôture MVP + reco Phase K |
| [`docs/15-Production-Readiness-Audit.md`](docs/15-Production-Readiness-Audit.md) | Audit K0 — checklist prod, plan K1–K5 |
| [`docs/19-Rapport-K3-CICD.md`](docs/19-Rapport-K3-CICD.md) | Rapport CI/CD (GitHub Actions, GHCR) |
| [`DAA - Chantiers360.txt`](DAA%20-%20Chantiers360.txt) | Architecture applicative cible |

Swagger : http://localhost:3000/api/docs

## Tests

Référence : [`docs/06-Cahier-de-tests.md`](docs/06-Cahier-de-tests.md)

```bash
# Frontend (Vitest + RTL)
npm run test --prefix frontend

# Backend unitaires (Jest)
npm run test --prefix backend

# Backend API (Supertest)
npm run test:api --prefix backend

# E2E (Playwright — démarre Vite automatiquement)
cd e2e && npm install && npx playwright install chromium
npm run test:e2e --prefix e2e

# Tout sauf E2E
npm run test

# Suite complète
npm run test:all

# CI locale (alignée GitHub Actions — Phase K3)
npm run ci:test
npm run ci:build
npm run ci:docker   # nécessite Docker
```
