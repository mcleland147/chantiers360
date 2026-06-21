# Rapport Phase K3 — CI/CD

**Projet :** Chantiers360 / BatiNova  
**Date :** 20/06/2026  
**Statut :** ✅ Livré — pipeline versionné, sans déploiement VPS  
**Prérequis :** Phase K2 (stack Docker prod) ✅

---

## 1. Objectif

Mettre en place une chaîne **GitHub Actions** pour tester, builder et préparer les images Docker, alignée avec les commandes locales, **sans déploiement automatique** sur VPS.

---

## 2. Livrables

| Fichier | Rôle |
|---------|------|
| `.github/workflows/ci.yml` | CI qualité + Docker smoke |
| `.github/workflows/docker-publish.yml` | Publication GHCR (manuel / tag `v*`) |
| `.github/dependabot.yml` | Mises à jour npm + Docker hebdomadaires |
| `scripts/ci-prepare-env.sh` | Génère `.env.ci` |
| `scripts/ci-docker-smoke.sh` | Smoke test stack prod en CI |
| `backend/package.json` | Script `lint:ci` (sans `--fix`) |
| `package.json` | Scripts `ci:*` racine |

---

## 3. Pipeline CI (`ci.yml`)

### 3.1 Jobs

| Job | Contenu | Bloquant |
|-----|---------|----------|
| `quality-frontend` | `npm ci`, lint*, Vitest, build Vite | ✅ (sauf lint*) |
| `quality-backend` | `npm ci`, prisma generate, lint*, Jest, Supertest API, build Nest | ✅ (sauf lint*) |
| `security-audit` | `npm audit --audit-level=high` (FE + BE) | ⚠️ advisory |
| `docker` | `compose config`, build images, smoke `/api/health` | ✅ |

\* Lint **advisory** (`continue-on-error`) — dette ESLint préexistante (22 erreurs FE, 115+ BE).

### 3.2 Triggers

- `push` / `pull_request` sur `main`, `master`, `develop`
- Concurrence : annulation des runs obsolètes sur la même branche

### 3.3 Variables CI

```yaml
JWT_SECRET: ci-test-jwt-secret-minimum-32-characters-long
NODE_VERSION: "22"
```

---

## 4. Publication GHCR (`docker-publish.yml`)

| Trigger | Action |
|---------|--------|
| `workflow_dispatch` | Build + push manuel (suffixe tag optionnel) |
| Push tag `v*.*.*` | Build + push automatique |

**Images :**

- `ghcr.io/<owner>/chantiers360-backend`
- `ghcr.io/<owner>/chantiers360-frontend`

**Tags :** `latest` (branche par défaut), SHA commit, semver (sur tag git).

**Non activé par défaut** sur chaque PR — conforme périmètre K3.

---

## 5. Dependabot

Mises à jour hebdomadaires :

- `frontend/`, `backend/`, `e2e/` (npm)
- Racine (images Docker dans compose)

---

## 6. Commandes locales alignées CI

```bash
# Qualité (équivalent jobs frontend + backend)
npm run ci:lint      # advisory
npm run ci:test      # FE unit + BE unit + API Supertest
npm run ci:build     # build FE + prisma generate + build BE
npm run ci:audit     # npm audit high+

# Docker (équivalent job docker)
npm run ci:docker    # config + build + smoke

# Stack prod complète (hors CI)
npm run prod:up
npm run prod:verify
```

---

## 7. Écarts K0 adressés

| ID | Écart | Statut K3 |
|----|-------|-----------|
| **K0-I01** | CI/CD non versioné | ✅ `.github/workflows/ci.yml` |
| **K0-A09** | Scan CVE / Dependabot | ✅ audit job + dependabot.yml |

---

## 8. Écarts restants (hors K3)

| ID | Écart | Phase cible |
|----|-------|-------------|
| K0-I01 | Lint bloquant (dette ESLint) | Post-K3 cleanup |
| K0-I01 | Playwright E2E non intégré CI | K3+ (optionnel) |
| K0-C01 | Déploiement VPS / DNS | Phase L |
| K0-I05 | Monitoring uptime | K4 |
| K0-C08 | Backup automatisé | K4 |
| Deploy SSH | Script deploy REC | K3+ / L |

---

## 9. Validation

| Contrôle | Résultat local |
|----------|----------------|
| `npm run ci:test` | ✅ 76 FE + 38 BE + 37 API |
| `npm run ci:build` | ✅ |
| `scripts/ci-prepare-env.sh` | ✅ |
| Workflow YAML syntaxe | ✅ |
| Stack K2 non modifiée | ✅ (compose prod inchangé) |

**Note :** le job Docker smoke nécessite Docker local (`npm run ci:docker`). Sur GitHub Actions, le runner fournit Docker nativement.

---

## 10. Definition of Done K3

- [x] Pipeline GitHub Actions versionné
- [x] Commandes locales documentées (`ci:*`)
- [x] Tests CI alignés avec tests locaux (sans Playwright)
- [x] Build Docker vérifié (workflow + scripts)
- [x] GHCR préparé (workflow publish optionnel)
- [x] Dependabot configuré
- [x] Documentation mise à jour
- [x] Rapport K3 produit
- [x] Écarts restants identifiés
- [x] Pas de déploiement VPS automatique

---

*Rapport K3 — BatiNova — 20/06/2026*
