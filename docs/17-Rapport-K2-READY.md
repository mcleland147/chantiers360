# Rapport K2-READY — État infra & préparation packaging

**Projet :** Chantiers360 / BatiNova  
**Date :** 20/06/2026  
**Contexte :** Analyse avant Phase K2 (packaging, TLS, `docker-compose.prod.yml`)  
**Prérequis levés :** Phase K1 (sécurité applicative) ✅

---

## 1. Synthèse exécutive

| Critère | État actuel | Bloquant K2 immédiat ? |
|---------|-------------|------------------------|
| `docker-compose.yml` dev-oriented | ✅ Fonctionnel en local | — |
| `docker-compose.prod.yml` | ❌ **Absent** | **Oui** |
| Frontend Docker | ❌ Serveur Vite dev (5173) | **Oui** |
| Backend Docker | ⚠️ Build Nest OK, gaps Prisma/ops | Partiel |
| PostgreSQL exposé host | ❌ Port 5432 public | **Oui** (prod) |
| TLS / reverse proxy | ❌ Absent | **Oui** (DoD K2) |
| `VITE_API_BASE_URL` | ❌ `localhost` au runtime | **Oui** |

**Verdict :** un `docker compose -f docker-compose.prod.yml up` **n’est pas possible aujourd’hui** — le fichier et les artefacts prod (Dockerfile Nginx, proxy TLS, env prod) restent à créer. Le stack dev actuel peut servir de base, avec **6 adaptations structurantes** (§5–§7).

---

## 2. Contenu exact — `docker-compose.yml` (actuel)

Fichier unique à la racine — **pas de variante prod**.

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: chantiers360-postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-chantiers360}
      POSTGRES_USER: ${POSTGRES_USER:-chantiers360}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-chantiers360}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
    container_name: chantiers360-backend
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-chantiers360}:${POSTGRES_PASSWORD:-chantiers360}@postgres:5432/${POSTGRES_DB:-chantiers360}?schema=public
      JWT_SECRET: ${JWT_SECRET:-replace-with-strong-secret}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-15m}
      PORT: 3000
    depends_on:
      - postgres
    ports:
      - "${BACKEND_PORT:-3000}:3000"

  frontend:
    build:
      context: ./frontend
    container_name: chantiers360-frontend
    environment:
      VITE_API_BASE_URL: http://localhost:${BACKEND_PORT:-3000}/api
    depends_on:
      - backend
    ports:
      - "${FRONTEND_PORT:-5173}:5173"

volumes:
  postgres_data:
```

**Observations :**

- Aucun `networks:`, `healthcheck`, `restart`, `profiles`.
- Variables K1 absentes : `NODE_ENV`, `CORS_ORIGIN`.
- `JWT_SECRET` avec fallback faible (incompatible `NODE_ENV=production` post-K1).
- `depends_on` sans condition `service_healthy`.

---

## 3. Contenu exact — Dockerfiles

### 3.1 `frontend/Dockerfile`

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
```

**Nature :** serveur de développement Vite — **non production** (perf, HMR, surface d’attaque, pas de build statique).

### 3.2 `backend/Dockerfile`

```dockerfile
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

**Nature :** image mono-étape — build + runtime mélangés.

**Gaps identifiés :**

| Gap | Impact |
|-----|--------|
| Pas de `npx prisma generate` | Build Docker propre peut échouer (client Prisma) |
| `npm install` inclut devDependencies | Image prod ~2× plus lourde |
| Pas d’étape `prisma migrate deploy` | Migrations manuelles post-démarrage |
| Pas de `.dockerignore` (FE/BE) | Contexte Docker potentiellement énorme |
| Pas de `NODE_ENV=production` | Comportement K1 (Swagger, JWT strict) non activé |

---

## 4. Ports actuellement exposés

Mapping **hôte → conteneur** (défauts si `.env` absent) :

| Service | Port hôte | Port conteneur | Protocole | Exposition |
|---------|-----------|----------------|-----------|------------|
| **postgres** | **5432** | 5432 | TCP | **0.0.0.0** (toutes interfaces) |
| **backend** | **3000** | 3000 | HTTP | **0.0.0.0** |
| **frontend** | **5173** | 5173 | HTTP (Vite dev) | **0.0.0.0** |

**En dev local :** 3 ports ouverts — pratique pour Prisma CLI / navigateur.

**Sur VPS Internet :** **5432 + 5173 + 3000** = surface d’attaque élevée (écarts K0-C04, K0-C05, K0-C01).

**Réseau Docker interne (non mappé) :** les services communiquent déjà via DNS `postgres:5432` et `backend:3000` sur le réseau bridge par défaut.

---

## 5. Dépendances bloquant un passage immédiat vers `docker-compose.prod.yml`

Le fichier **`docker-compose.prod.yml` n’existe pas** (référencé uniquement dans `docs/15-Production-Readiness-Audit.md`).

### 5.1 Bloquants techniques (à créer en K2)

| # | Dépendance | Écart K0 | Détail |
|---|------------|----------|--------|
| 1 | **`frontend/Dockerfile.prod`** | K0-C05 | Build Vite + Nginx ; pas de variante aujourd’hui |
| 2 | **`docker-compose.prod.yml`** | K0-C04, I10 | Fichier absent |
| 3 | **Reverse proxy TLS** | K0-C01 | Pas de Caddy/Nginx/Traefik dans le dépôt |
| 4 | **`VITE_API_BASE_URL` au build** | K0-I09 | Variable Vite **figée au `npm run build`** — env runtime Compose frontend **sans effet** |
| 5 | **`.env.prod` / `.env.prod.example`** | K0-I07 | Template prod non versionné |
| 6 | **`CORS_ORIGIN` aligné domaine** | K0-C07 (K1) | Doit correspondre à l’URL publique du frontend |
| 7 | **`JWT_SECRET` fort** | K0-C03 (K1) | Boot refusé en prod si secret faible ; fallback Compose actuel invalide |
| 8 | **Prisma generate dans image BE** | — | Requis pour build reproductible |
| 9 | **Healthchecks + `restart: unless-stopped`** | K0-I10 | Absents |
| 10 | **Pas de seed auto en prod** | K0-C06 | Procédure documentée mais pas d’entrypoint différencié |

### 5.2 Bloquants infra (hors dépôt, requis DoD K2)

| # | Élément | Statut |
|---|---------|--------|
| 11 | VPS + DNS (`app.` / `api.` ou domaine unique) | À provisionner |
| 12 | Certificats TLS (Let’s Encrypt / Caddy) | À configurer |
| 13 | Secrets ops (mots de passe Postgres, JWT) | À générer hors Git |

### 5.3 Non bloquants mais recommandés K2

- `.dockerignore` frontend/backend  
- Backend multi-stage (`npm ci --omit=dev` en runtime)  
- Script `scripts/deploy-rec.sh`  
- `logging:` rotation json-file (guide exploitation §6)

---

## 6. Adaptations — frontend derrière Nginx

### 6.1 Objectif architecture

```
Internet :443
    └── Reverse proxy (Caddy/Nginx host ou container)
            ├── /        → Nginx container (static React dist)
            └── /api/*   → NestJS :3000 (réseau interne)
```

*Alternative :* sous-domaines `app.` + `api.` (CORS `CORS_ORIGIN=https://app...`).

### 6.2 Livrables à créer

**A. `frontend/Dockerfile.prod` (multi-stage)**

```dockerfile
# Stage 1 — build
FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 — serve
FROM nginx:1.27-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

**B. `frontend/nginx/default.conf`**

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|svg|ico|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

**C. Si proxy `/api` sur le même domaine** (recommandé — CORS simplifié) :

- `VITE_API_BASE_URL=/api` (URL relative) **ou** `https://app.client.fr/api`
- Nginx host ou sidecar :

```nginx
location /api/ {
    proxy_pass http://backend:3000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

**D. Adaptations code (mineures, à valider en K2)**

| Fichier | Adaptation |
|---------|------------|
| `frontend/src/services/apiClient.ts` | Supporter URL relative `/api` (déjà OK si `baseURL: '/api'`) |
| `frontend/vite.config.ts` | Optionnel : `base` si déploiement sous sous-chemin |
| `backend/src/main.ts` | Optionnel : `app.set('trust proxy', 1)` si derrière reverse proxy (cookies futurs, logs IP) |

**E. React Router**

- `createBrowserRouter` sans `basename` → OK racine `/`.
- Nginx `try_files` **obligatoire** pour `/chantiers`, `/dashboard`, etc.

### 6.3 Piège actuel à corriger

```yaml
# docker-compose.yml — INEFFICACE pour Vite build
environment:
  VITE_API_BASE_URL: http://localhost:${BACKEND_PORT:-3000}/api
```

En prod, passer par **build args** :

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile.prod
    args:
      VITE_API_BASE_URL: ${VITE_API_BASE_URL}
```

---

## 7. Adaptations — isoler PostgreSQL du réseau public

### 7.1 État actuel (risque)

```yaml
ports:
  - "${POSTGRES_PORT:-5432}:5432"   # bind 0.0.0.0:5432 sur l’hôte VPS
```

PostgreSQL est **joignable depuis Internet** si le firewall VPS n’ bloque pas 5432.

### 7.2 Cible `docker-compose.prod.yml`

```yaml
postgres:
  image: postgres:16-alpine
  # PAS de section ports: en prod
  environment:
    POSTGRES_DB: ${POSTGRES_DB}
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  # secret fort, hors défaut
  volumes:
    - postgres_data:/var/lib/postgresql/data
  networks:
    - internal
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
    interval: 10s
    timeout: 5s
    retries: 5
  restart: unless-stopped

backend:
  networks:
    - internal
    - web
  depends_on:
    postgres:
      condition: service_healthy

networks:
  internal:
    internal: true    # aucun accès sortant/entrant depuis l’extérieur Docker
  web:
    driver: bridge
```

**Effets :**

- Postgres **uniquement** joignable par `backend` sur le réseau `internal`.
- Pas de mapping port hôte → aucune exposition Internet directe.

### 7.3 Accès admin BDD (backup, debug)

| Besoin | Méthode recommandée |
|--------|---------------------|
| `pg_dump` planifié | Container sidecar ou `docker compose exec postgres pg_dump` (SSH sur VPS) |
| DBeaver local | Tunnel SSH : `ssh -L 5432:localhost:5432 deploy@vps` + compose dev **ou** port bind `127.0.0.1:5432:5432` **uniquement REC** |
| Prod stricte | Aucun port Postgres sur l’hôte |

### 7.4 Durcissements complémentaires

- Mot de passe Postgres **≠** `chantiers360` (écart K0-C06).
- Ne pas exécuter `prisma:seed` en prod (comptes `demo123`).
- Firewall VPS (UFW) : autoriser **443** (et 22 SSH restreint), bloquer 5432/3000/5173.

---

## 8. Esquisse cible `docker-compose.prod.yml`

Structure recommandée (à implémenter en K2) :

| Service | Image / build | Ports publics | Réseau |
|---------|---------------|---------------|--------|
| **caddy** (ou nginx host) | `caddy:2-alpine` | 80, 443 | web |
| **frontend** | `Dockerfile.prod` | aucun (via caddy) | web |
| **backend** | `backend/Dockerfile` amélioré | aucun (via caddy `/api`) | web + internal |
| **postgres** | `postgres:16-alpine` | **aucun** | internal |

Variables prod minimales (`.env.prod`) :

```bash
NODE_ENV=production
POSTGRES_PASSWORD=<généré>
JWT_SECRET=<openssl rand -base64 48>
CORS_ORIGIN=https://app.client.fr
VITE_API_BASE_URL=https://app.client.fr/api
# ENABLE_SWAGGER=false  # défaut K1
```

---

## 9. Checklist K2 — ordre de travail suggéré

1. [ ] Créer `.dockerignore` (FE/BE)  
2. [ ] Corriger `backend/Dockerfile` (`prisma generate`, multi-stage)  
3. [ ] Créer `frontend/Dockerfile.prod` + `nginx/default.conf`  
4. [ ] Créer `docker-compose.prod.yml` (réseaux, healthchecks, pas de 5432)  
5. [ ] Créer `.env.prod.example`  
6. [ ] Ajouter reverse proxy TLS (Caddy recommandé — TLS auto)  
7. [ ] Tester : `docker compose -f docker-compose.prod.yml up --build`  
8. [ ] `prisma migrate deploy` + **sans seed**  
9. [ ] Vérifier HTTPS, login JWT, CORS, health  
10. [ ] Mettre à jour DAT + guide exploitation  

**DoD K2 (rappel audit) :** REC accessible en HTTPS ; compose prod up ; `/api/health` OK.

---

## 10. Conclusion

Le projet est **K1-ready** (sécurité applicative) mais **pas K2-ready** en l’état : l’infra Docker actuelle est un **stack de développement** avec trois ports publics et un frontend Vite non buildé.

**Effort K2 estimé (audit K0) :** 2–3 j/h — cohérent avec les 6 livrables ci-dessus.

**Prochaine action recommandée :** implémenter `docker-compose.prod.yml` + `frontend/Dockerfile.prod` + proxy Caddy en une première PR K2, sans toucher au `docker-compose.yml` dev existant.

---

*Rapport K2-READY — BatiNova — 20/06/2026*
