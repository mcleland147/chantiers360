# Audit Production Readiness — Chantiers360 (K0)

**Version :** 1.0  
**Date :** 20/06/2026  
**Phase :** K0 — Audit pré-mise en ligne  
**Périmètre :** MVP livré (Phases A–J), code + DAT + guides + rapport clôture  
**Références :** [`08-DAT-v1.md`](08-DAT-v1.md), [`14-Rapport-Cloture-MVP.md`](14-Rapport-Cloture-MVP.md), [`10-Guide-Exploitation.md`](10-Guide-Exploitation.md)

---

## 1. Synthèse exécutive

Chantiers360 est **fonctionnellement prêt pour une recette client** (REC), mais **non prêt pour une mise en ligne publique** sans les travaux de la Phase K.

| Indicateur | État actuel | Cible PROD |
|------------|-------------|------------|
| Fonctionnel MVP | ✅ Complet (Phase J) | ✅ |
| Tests automatisés | ✅ 76 FE + 30 BE + 27 API + 41 E2E | CI obligatoire |
| Docker dev | ✅ Compose postgres + backend + frontend Vite | Compose prod + Nginx |
| Sécurité réseau | ❌ HTTP, CORS ouvert, lectures API publiques | HTTPS, CORS restreint, auth lecture |
| Exploitation | ⚠️ Procédures documentées, non automatisées | Cron backup, monitoring, runbooks |
| CI/CD | ❌ Non versionné | Pipeline GitHub Actions |

**Verdict :** démarrer Phase K immédiatement ; **délai réaliste mise en ligne PROD : 3 à 5 semaines** (1 dev + 0,5 j exploitant/mois).

---

## 2. Checklist Production Readiness

Légende : ✅ OK · ⚠️ Partiel · ❌ Manquant

### 2.1 Sécurité

| # | Critère | État | Constat code / infra |
|---|---------|------|----------------------|
| S1 | HTTPS bout-en-bout | ❌ | Pas de reverse proxy TLS ; dev en HTTP |
| S2 | Secret JWT fort (≠ dev) | ❌ | Défaut `dev-secret-change-in-production` / `replace-with-strong-secret` |
| S3 | CORS restreint au domaine front | ❌ | `origin: true` dans `backend/src/main.ts` |
| S4 | Authentification sur lectures sensibles | ❌ | `GET /chantiers`, onglets, historique **sans guard** |
| S5 | Rate limiting login | ❌ | Absent |
| S6 | Headers sécurité (Helmet) | ❌ | Non installé |
| S7 | Swagger désactivé ou protégé en PROD | ❌ | `/api/docs` public |
| S8 | Mots de passe bcrypt | ✅ | Seed + auth service |
| S9 | Validation entrées (DTO) | ✅ | `ValidationPipe` global |
| S10 | Secrets hors Git | ⚠️ | `.env.example` OK ; risque si `.env` commité |
| S11 | Token localStorage (XSS) | ⚠️ | Acceptable MVP ; refresh + httpOnly cookie = V2/K2 |
| S12 | Headers legacy `X-User-Id` | ⚠️ | Contournement auth possible si laissé en PROD |
| S13 | PostgreSQL non exposé Internet | ❌ | Port `5432` mappé dans `docker-compose.yml` |
| S14 | Mot de passe DB fort | ❌ | Défaut `chantiers360` / `chantiers360` |

### 2.2 Hébergement

| # | Critère | État | Constat |
|---|---------|------|---------|
| H1 | Environnement REC dédié | ❌ | Uniquement local / Docker dev |
| H2 | Environnement PROD séparé | ❌ | Non provisionné |
| H3 | Nom de domaine | ❌ | Non configuré |
| H4 | Pare-feu (22, 80, 443 uniquement) | ❌ | Non documenté opérationnellement |
| H5 | Capacité dimensionnée (~30 users PME) | ⚠️ | 2 vCPU / 4 Go suffisants (cf. chiffrage) |
| H6 | Plan de reprise (RTO/RPO) | ⚠️ | RPO 24 h / RTO 4 h documentés DAT, non testés |

### 2.3 Docker

| # | Critère | État | Constat |
|---|---------|------|---------|
| D1 | Backend image multi-stage build | ✅ | `backend/Dockerfile` → `start:prod` |
| D2 | Frontend image production (Nginx) | ❌ | `frontend/Dockerfile` = **Vite dev** |
| D3 | `docker-compose.prod.yml` | ✅ | Phase K2 — réseaux internal/web, healthchecks |
| D4 | Variables injectées (pas de secrets en image) | ⚠️ | Env compose OK ; secrets faibles par défaut |
| D5 | Healthcheck containers | ❌ | Absent dans compose |
| D6 | Restart policy | ❌ | Non défini (`unless-stopped` recommandé) |
| D7 | Réseau interne DB isolée | ❌ | Postgres accessible depuis l'hôte |

### 2.4 PostgreSQL

| # | Critère | État | Constat |
|---|---------|------|---------|
| P1 | PostgreSQL 16 | ✅ | `postgres:16-alpine` |
| P2 | Migrations versionnées | ✅ | Prisma migrations (`0001`, `0002`) |
| P3 | Seed séparé REC / PROD | ⚠️ | `prisma:seed` avec comptes demo — **interdit en PROD** |
| P4 | Connexion chiffrée (SSL) | ❌ | `DATABASE_URL` sans SSL |
| P5 | Utilisateur DB à privilèges minimaux | ❌ | User applicatif = owner |
| P6 | Pool connexions / limites | ⚠️ | Prisma default ; non tuné |

### 2.5 Sauvegardes

| # | Critère | État | Constat |
|---|---------|------|---------|
| B1 | Procédure `pg_dump` documentée | ✅ | `docs/10-Guide-Exploitation.md` §4 |
| B2 | Sauvegarde automatisée (cron) | ❌ | Manuel uniquement |
| B3 | Stockage externe (hors serveur) | ❌ | Non configuré |
| B4 | Test restauration daté | ❌ | Non exécuté |
| B5 | Rétention 30 j PROD | ❌ | Politique DAT seulement |
| B6 | Backup volume Docker | ❌ | Snapshot non automatisé |

### 2.6 JWT

| # | Critère | État | Constat |
|---|---------|------|---------|
| J1 | Login / me fonctionnels | ✅ | HS256, bcrypt |
| J2 | Expiration configurable | ✅ | `JWT_EXPIRES_IN` (15m) |
| J3 | Refresh token | ❌ | Reporté V2 |
| J4 | Logout / invalidation | ❌ | Pas d'endpoint ; token jusqu'à expiry |
| J5 | Rotation secret JWT | ❌ | Procédure absente |
| J6 | Guards sur mutations | ✅ | `UserContextGuard` / `JwtAuthGuard` |
| J7 | Guards sur lectures métier | ❌ | Gap majeur chantiers |

### 2.7 Monitoring

| # | Critère | État | Constat |
|---|---------|------|---------|
| M1 | Health endpoint | ✅ | `GET /api/health` |
| M2 | Sonde externe uptime | ❌ | Non déployée (UptimeRobot, etc.) |
| M3 | Métriques (CPU, RAM, latence) | ❌ | Pas Prometheus/Grafana |
| M4 | Alertes incident | ❌ | Pas PagerDuty / email ops |
| M5 | Dashboard ops | ❌ | — |
| M6 | APM / traces | ❌ | — |

### 2.8 Logs

| # | Critère | État | Constat |
|---|---------|------|---------|
| L1 | Logs stdout backend | ✅ | NestJS default |
| L2 | Format structuré JSON | ❌ | Console texte |
| L3 | Niveaux log PROD (warn+) | ❌ | Non configuré |
| L4 | Rotation logs Docker | ❌ | Recommandé DAT, non appliqué |
| L5 | Agrégation centralisée | ❌ | Pas Loki / CloudWatch |
| L6 | Corrélation requête (requestId) | ❌ | — |

### 2.9 CI/CD

| # | Critère | État | Constat |
|---|---------|------|---------|
| C1 | Pipeline tests sur push/PR | ❌ | Modèle YAML dans DAT, **non commité** |
| C2 | Build frontend + backend CI | ❌ | — |
| C3 | Tests API avec Postgres CI | ❌ | — |
| C4 | E2E Playwright CI | ❌ | 41 tests locaux (mocks) |
| C5 | Scan dépendances (npm audit) | ❌ | — |
| C6 | Build & push images Docker | ❌ | — |
| C7 | Déploiement automatisé REC/PROD | ❌ | — |
| C8 | Rollback documenté | ⚠️ | Procédure manuelle guide exploitation |

### 2.10 DNS

| # | Critère | État | Constat |
|---|---------|------|---------|
| N1 | Enregistrements A/AAAA | ❌ | — |
| N2 | Sous-domaines app / api | ❌ | Recommandé : `app.` + `api.` |
| N3 | TTL adapté | ❌ | — |
| N4 | SPF/DMARC (si emails V2) | ❌ | Hors scope MVP |

### 2.11 SSL

| # | Critère | État | Constat |
|---|---------|------|---------|
| T1 | Certificat TLS valide | ❌ | — |
| T2 | Renouvellement auto (Let's Encrypt) | ❌ | Caddy / Certbot à prévoir |
| T3 | Redirection HTTP → HTTPS | ❌ | — |
| T4 | TLS PostgreSQL (si DB managée) | ❌ | — |
| T5 | HSTS | ❌ | — |

### 2.12 Exploitation

| # | Critère | État | Constat |
|---|---------|------|---------|
| E1 | Guide démarrage / arrêt | ✅ | `docs/10-Guide-Exploitation.md` |
| E2 | Guide utilisateur par rôle | ✅ | `docs/09-Guide-Utilisateur.md` |
| E3 | Runbook incident | ⚠️ | § dépannage basique |
| E4 | Procédure mise à jour | ✅ | Documentée |
| E5 | Cahier recette REC-001–015 | ⚠️ | Documenté ; campagne manuelle à finaliser |
| E6 | Contacts support / astreinte | ❌ | Non défini |
| E7 | Politique mots de passe demo | ❌ | `demo123` en seed — à supprimer PROD |

---

## 3. Classification des écarts

### 3.1 Critique — bloquant mise en ligne

| ID | Écart | Risque | Fichiers / zone |
|----|-------|--------|-----------------|
| **K0-C01** | Pas de HTTPS / TLS | Interception credentials, JWT | Infra |
| **K0-C02** | Lectures chantier sans authentification | Fuite données métier (clients, réserves, photos) | `projects.controller.ts` |
| **K0-C03** | JWT secret faible par défaut | Forge token, élévation privilèges | `.env`, `auth.module.ts` |
| **K0-C04** | PostgreSQL exposé + credentials par défaut | Compromission base | `docker-compose.yml` |
| **K0-C05** | Frontend Docker = serveur dev Vite | Perf, sécurité, instabilité | `frontend/Dockerfile` |
| **K0-C06** | Seed demo (`demo123`) en PROD | Accès non autorisé | `prisma/seed.ts` |
| **K0-C07** | CORS `origin: true` | CSRF-like, appels cross-site | `main.ts` |
| **K0-C08** | Pas de sauvegarde automatisée testée | Perte données irréversible | Ops |

### 3.2 Important — requis avant PROD client

| ID | Écart | Risque | Fichiers / zone |
|----|-------|--------|-----------------|
| **K0-I01** | CI/CD non versionné | Régressions non détectées | ✅ `.github/workflows/ci.yml` (K3) |
| **K0-I02** | Swagger public en PROD | Surface d'attaque, introspection API | `main.ts` |
| **K0-I03** | Pas de rate limit login | Brute force | Auth module |
| **K0-I04** | Headers `X-User-Id` legacy | Bypass auth | `UserContextGuard` |
| **K0-I05** | Pas de monitoring uptime | Indisponibilité non détectée | Infra |
| **K0-I06** | Logs non structurés / rotation | Debug prod difficile, disque plein | Docker |
| **K0-I07** | Environnements REC/PROD non séparés | Erreur déploiement | Infra |
| **K0-I08** | Campagne recette REC incomplète | Bugs métier en prod | `07-Cahier-Recette-Metier.md` |
| **K0-I09** | `VITE_API_BASE_URL` hardcodé localhost dans compose | Front prod ne joint pas l'API | `docker-compose.yml` |
| **K0-I10** | Pas de healthcheck / restart Docker | Containers down silencieux | Compose |

### 3.3 Amélioration — post go-live ou V2

| ID | Écart | Bénéfice | Phase |
|----|-------|----------|-------|
| **K0-A01** | Refresh token JWT | UX, sécurité session | K5 / V2 |
| **K0-A02** | Upload photo binaire + stockage objet | Usage terrain réel | V2 |
| **K0-A03** | Prometheus + Grafana | Observabilité avancée | K4+ |
| **K0-A04** | PostgreSQL managé | HA, backup intégré | Scale |
| **K0-A05** | WAF / CDN | DDoS, cache assets | Scale |
| **K0-A06** | E2E contre API réelle en CI | Confiance déploiement | K3 |
| **K0-A07** | MobileLayout dédié (bottom nav) | UX chef terrain | V2 |
| **K0-A08** | Helmet + CSP | Durcissement navigateur | K2 |
| **K0-A09** | Scan CVE automatisé (Dependabot) | Supply chain | K3 |
| **K0-A10** | Multi-tenant / admin | Extension produit | V2 |

---

## 4. Estimation de charge

Unité : **j/h** (développeur full-stack senior). Fourchette @ **600 €/j/h HT**.

| Écart(s) | Effort (j/h) | Risque | Complexité | Lot K |
|----------|-------------|--------|------------|-------|
| K0-C01, T1–T3, N1–N2 (TLS + DNS + reverse proxy) | 2–3 | Moyen | Moyenne | K2 |
| K0-C02, K0-I04 (auth lectures + retrait legacy) | 3–4 | Élevé | Moyenne | K1 |
| K0-C03, K0-C07, K0-I03, K0-I02 (durcissement sécurité) | 2–3 | Élevé | Faible | K1 |
| K0-C04, P4–P5 (PostgreSQL durci) | 1–2 | Élevé | Faible | K2 |
| K0-C05, K0-I09, D3 (Docker prod + Nginx) | 3–4 | Moyen | Moyenne | K2 |
| K0-C06 (seed PROD / init users) | 1 | Moyen | Faible | K1 |
| K0-C08, B2–B4 (backup auto + test restore) | 2–3 | Élevé | Moyenne | K4 |
| K0-I01, C1–C4 (CI/CD complet) | 3–4 | Moyen | Moyenne | K3 |
| K0-I05, M2 (monitoring uptime) | 1 | Faible | Faible | K4 |
| K0-I06, L2–L4 (logs prod) | 1–2 | Faible | Faible | K4 |
| K0-I07 (env REC + PROD) | 2 | Moyen | Moyenne | K2 |
| K0-I08 (recette manuelle) | 2–3 | Moyen | Faible* | K5 |
| K0-I10, D5–D6 (compose prod) | 1 | Faible | Faible | K2 |
| K0-A01 refresh token | 3–4 | Faible | Moyenne | K5 |
| Tests + doc + buffer 15 % | 3–4 | — | — | Transverse |

\*Recette = effort MOA/client possible.

**Total Phase K (PROD ready) : 28–38 j/h** → **17 000 – 23 000 € HT** @ 600 €/j/h.  
**Fourchette consolidée recommandée : 30–35 j/h (~4–5 semaines calendaires, 1 dev).**

---

## 5. Proposition de plan Phase K

Découpage par **risque décroissant** : sécurité d'abord, puis packaging, automatisation, ops, go-live.

### K1 — Sécurité applicative (Semaine 1)

**Objectif :** éliminer les écarts critiques applicatifs avant toute exposition réseau.

| Tâche | Écarts |
|-------|--------|
| Protéger toutes les routes `GET` chantiers / onglets / historique (`JwtAuthGuard` + contrôle rôle) | K0-C02 |
| Retirer ou désactiver `X-User-Id` en PROD | K0-I04 |
| CORS whitelist (`CORS_ORIGIN`) | K0-C07 |
| Secret JWT obligatoire (fail boot si défaut) | K0-C03 |
| Désactiver Swagger si `NODE_ENV=production` | K0-I02 |
| Rate limit `POST /auth/login` | K0-I03 |
| Script init PROD sans seed demo ; création users admin | K0-C06 |
| Tests API + mise à jour `docs/API.md` | — |

**DoD K1 :** aucune fuite données sans JWT ; tests verts ; revue sécurité checklist §2.1 ≥ 8/14 ✅.

---

### K2 — Packaging & hébergement (Semaine 2) — ✅ Livré (REC locale)

**Objectif :** stack déployable en REC avec TLS.

| Tâche | Écarts | Statut |
|-------|--------|--------|
| `frontend/Dockerfile.prod` (build Vite + Nginx) | K0-C05 | ✅ |
| `docker-compose.prod.yml` (pas de port 5432 public, restart, healthcheck) | K0-C04, K0-I10 | ✅ |
| Reverse proxy Caddy + TLS local | K0-C01, T1–T3 | ✅ (VPS DNS = Phase L) |
| `VITE_API_BASE_URL` au build (arg Docker) | K0-I09 | ✅ |
| `.env.prod.example` + `scripts/verify-prod-stack.sh` | K0-I07 | ✅ |
| Mise à jour DAT + guide exploitation | — | ✅ |

**DoD K2 :** ✅ `docker compose -f docker-compose.prod.yml up --build` ; health OK ; HTTPS localhost ; Swagger off.

**Rapport :** `docs/18-Rapport-K2-Packaging-Production.md`

---

### K3 — CI/CD (Semaine 3) — ✅ Livré

**Objectif :** qualité continue et déploiement reproductible.

| Tâche | Écarts | Statut |
|-------|--------|--------|
| `.github/workflows/ci.yml` (FE + BE + API + build + Docker) | K0-I01 | ✅ |
| Job Playwright (optionnel smoke) | C4 | ⚠️ Hors CI (mocks) |
| `npm audit` / Dependabot | K0-A09 | ✅ advisory + dependabot.yml |
| Workflow build images + push registry (GHCR) | C6 | ✅ `docker-publish.yml` (manuel) |
| Script deploy REC (SSH + compose pull) | C7 | ⚠️ Phase L |
| Documentation procédure rollback | C8 | ⚠️ K4 |

**DoD K3 :** ✅ PR bloquée si tests KO ; images buildables ; GHCR prêt ; pas de deploy VPS auto.

**Rapport :** `docs/19-Rapport-K3-CICD.md`

---

### K4 — Exploitation & résilience (Semaine 4)

**Objectif :** backup, logs, monitoring minimum.

| Tâche | Écarts |
|-------|--------|
| Cron `pg_dump` + sync stockage externe (S3/OVH Object Storage) | K0-C08, B2–B3 |
| **Test restauration** daté et trace écrit | B4 |
| UptimeRobot / Better Stack sur `/api/health` | K0-I05 |
| Logs JSON + rotation Docker (`json-file` max-size) | K0-I06 |
| Runbook incident (P1/P2/P3) | E3, E6 |
| Alertes email ops | M4 |

**DoD K4 :** restore testé < 4 h ; alerte si health down > 5 min.

---

### K5 — Go-live & stabilisation (Semaine 5)

**Objectif :** bascule PROD et hypercare.

| Tâche | Écarts |
|-------|--------|
| Campagne REC-001 à REC-015 sur env REC | K0-I08 |
| Clone REC → PROD (secrets distincts) | H2 |
| (Optionnel) Refresh token | K0-A01 |
| Hypercare 2 semaines post go-live | — |
| Mise à jour `14-Rapport-Cloture-MVP` → statut PROD | — |
| Revue post-mortem K0 | — |

**DoD K5 :** REC signé ; PROD live ; checklist §2 ≥ 90 % ✅ ou ⚠️ justifié.

---

## 6. Recommandation d'hébergement

Contexte : **PME BTP ~30 utilisateurs**, stack **Docker Compose** (NestJS + Nginx + PostgreSQL), budget infra **modéré**, équipe ops **limitée**.

### 6.1 Comparatif

| Critère | OVH VPS | Azure | AWS |
|---------|---------|-------|-----|
| **Simplicité MVP** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Coût mensuel MVP** | 15–40 € | 80–200 € | 70–180 € |
| **Docker Compose natif** | ✅ Idéal | ⚠️ VM ou Container Apps | ⚠️ EC2 ou ECS |
| **PostgreSQL managé** | Option Web Cloud Databases (~15 €) | Azure Database for PostgreSQL (~30 €+) | RDS (~25 €+) |
| **Backup intégré** | Snapshot VPS / Object Storage | Azure Backup | AWS Backup |
| **TLS gratuit** | Certbot / Caddy | App Gateway / Front Door ($$) | ACM + ALB |
| **Conformité FR / RGPD** | ✅ Datacenter FR | ✅ Région France Central | ✅ Région Paris |
| **Montée en charge** | Verticale (vCPU/RAM) | Horizontale + PaaS | Horizontale, large gamme |
| **Vendor lock-in** | Faible | Moyen | Moyen |
| **Courbe apprentissage** | Faible | Moyenne | Élevée |

### 6.2 Recommandation MVP

**Choix recommandé : OVH VPS (France)**

| Profil | Config | Usage |
|--------|--------|-------|
| **REC** | VPS Essential 2 vCPU / 4 Go / 80 Go SSD | Staging client, recette |
| **PROD** | VPS Comfort 4 vCPU / 8 Go / 160 Go SSD | ~30 users, marge photos URL |

**Pourquoi pas Azure/AWS en MVP ?**

- Surdimensionné pour un monolithe Docker Compose à 30 users.
- Coût 3–5× supérieur (Load Balancer, Container Apps minimum, RDS).
- Pertinent si le client est **déjà Azure/Microsoft 365** (SSO futur) ou exige **contrat entreprise cloud**.

**Quand migrer vers Azure/AWS ?**

- > 100 utilisateurs concurrents
- Upload photo S3 / Blob obligatoire (V2)
- SLA 99,9 % contractuel
- Équipe DevOps dédiée

---

## 7. Recommandation de mise en ligne

### 7.1 Architecture cible PROD

```
                    Internet (HTTPS)
                           │
                    ┌──────▼──────┐
                    │ Caddy/Nginx  │  :443 TLS (Let's Encrypt)
                    │ Reverse proxy│
                    └──┬───────┬──┘
                       │       │
              app.domain│       │api.domain
                       │       │
              ┌────────▼──┐ ┌──▼─────────┐
              │  Nginx    │ │  NestJS     │
              │  (static) │ │  :3000      │
              │  React    │ │  /api       │
              └───────────┘ └──┬─────────┘
                                 │ réseau Docker interne
                          ┌──────▼──────┐
                          │ PostgreSQL 16│  (non exposé)
                          │ volume perso │
                          └─────────────┘

Sauvegardes : pg_dump → OVH Object Storage (quotidien)
Monitoring  : UptimeRobot → /api/health
Logs        : docker logs + rotation 50 Mo × 5
```

**Domaines suggérés :**

- `app.chantiers360.client.fr` → frontend
- `api.chantiers360.client.fr` → backend (ou même domaine `/api` via proxy)

### 7.2 Coût mensuel estimé

| Poste | REC | PROD |
|-------|-----|------|
| VPS OVH | 15–25 € | 40–60 € |
| Domaine + DNS | ~1 € | ~1 € |
| Object Storage backup (~10 Go) | 2–5 € | 5–10 € |
| Monitoring gratuit (UptimeRobot) | 0 € | 0 € |
| **Total infra** | **~20–35 €/mois** | **~50–75 €/mois** |
| Support correctif (0,5 j/m) | — | ~300 €* |

\*Hors contrat de maintenance applicative.

**Coût one-shot Phase K :** 30–35 j/h dev (~18 000 – 21 000 € HT).

### 7.3 Procédure de déploiement (PROD)

```bash
# 1. Prérequis serveur (Ubuntu 24.04, Docker, utilisateur deploy)
ssh deploy@prod-server

# 2. Cloner release taguée
git clone --branch v1.0.0 https://github.com/org/chantiers360.git
cd chantiers360

# 3. Configurer secrets (jamais en Git)
cp .env.prod.example .env.prod
# Éditer : JWT_SECRET, POSTGRES_PASSWORD, CORS_ORIGIN, VITE_API_BASE_URL

# 4. Build & démarrage
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# 5. Migrations (sans seed demo)
docker compose -f docker-compose.prod.yml exec backend npm run prisma:deploy

# 6. Vérifications
curl -s https://api.domain.fr/api/health
curl -sI https://app.domain.fr | head -1

# 7. Smoke test manuel (conducteur + direction)
# 8. Activer sonde uptime + cron backup
```

**Rollback :** redeploy image tag `N-1` + restore DB si migration destructive (cf. guide exploitation §6).

### 7.4 Stratégie de sauvegarde

| Élément | Fréquence | Rétention | Stockage |
|---------|-----------|-----------|----------|
| PostgreSQL (`pg_dump -Fc`) | Quotidien 02:00 | 30 j PROD / 7 j REC | OVH Object Storage chiffré |
| Volume `postgres_data` | Hebdo (snapshot VPS) | 4 semaines | OVH snapshot |
| Fichiers config `.env` | À chaque changement | 12 versions | Vault / coffre client |
| Images Docker | Chaque release | 5 dernières | GHCR |

**Test restore obligatoire :** avant go-live PROD et **trimestriel** ensuite.  
**RPO cible :** 24 h · **RTO cible :** 4 h (aligné DAT).

---

## 8. Matrice risques / priorités

| Risque | Probabilité | Impact | Mitigation Phase K |
|--------|-------------|--------|-------------------|
| Fuite données (API publique) | Élevée | Critique | K1 |
| Perte base (pas de backup) | Moyenne | Critique | K4 |
| Indisponibilité non détectée | Moyenne | Élevé | K4 |
| Régression post-deploy | Élevée | Moyen | K3 |
| Compromission JWT | Faible* | Critique | K1 (*si secret fort) |
| Dépassement budget cloud | Faible | Moyen | OVH VPS |

---

## 9. Critères de sortie K0 → démarrage K1

- [x] Audit documenté (ce document)
- [x] Écarts classés Critique / Important / Amélioration
- [x] Plan K1–K5 validé par MOA / client
- [ ] Budget Phase K arbitré (~30 j/h)
- [ ] Choix hébergeur confirmé (recommandation : OVH)
- [ ] Fenêtre go-live PROD cible définie

---

## 10. Références croisées

| Document | Lien |
|----------|------|
| Architecture technique | [`08-DAT-v1.md`](08-DAT-v1.md) |
| Clôture MVP | [`14-Rapport-Cloture-MVP.md`](14-Rapport-Cloture-MVP.md) |
| Exploitation | [`10-Guide-Exploitation.md`](10-Guide-Exploitation.md) |
| Chiffrage | [`13-Chiffrage.md`](13-Chiffrage.md) |
| Roadmap V2 | [`12-Roadmap-V2.md`](12-Roadmap-V2.md) |

---

*Document généré en Phase K0 — base de travail pour les lots K1 à K5. Toute évolution post-audit doit mettre à jour ce fichier et le DAT v1.*
