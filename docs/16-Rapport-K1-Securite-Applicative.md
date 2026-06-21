# Rapport Phase K1 — Sécurité applicative

**Projet :** Chantiers360 / BatiNova  
**Date :** 20/06/2026  
**Statut :** ✅ Livré — écarts K1 levés  
**Référence audit :** [15-Production-Readiness-Audit.md](./15-Production-Readiness-Audit.md)

---

## 1. Objectif

Lever les écarts **critiques et importants** de sécurité applicative identifiés en K0, avant toute exposition Internet de l'API.

**Périmètre K1 :** authentification obligatoire, retrait auth legacy en production, durcissement JWT, CORS restrictif, Swagger désactivé en production.

---

## 2. Synthèse des écarts levés

| ID K0 | Écart | Statut K1 | Preuve |
|-------|-------|-----------|--------|
| **K0-C02** | Lectures chantier sans authentification | ✅ Levé | `JwtAuthGuard` + `RolesGuard` sur tous les GET chantiers, onglets, historique, réserves, photos, dashboard, users |
| **K0-C03** | JWT secret faible par défaut | ✅ Levé | Validation au boot (`assertJwtSecretConfigured`, `assertJwtSecretStrength`), plus de secret par défaut dans `AuthModule` |
| **K0-C07** | CORS `origin: true` | ✅ Levé | Whitelist via `CORS_ORIGIN` (`parseCorsOrigins`, `configureCors`) |
| **K0-I02** | Swagger public en PROD | ✅ Levé | `configureSwagger` : désactivé si `NODE_ENV=production` (sauf `ENABLE_SWAGGER=true`) |
| **K0-I04** | Headers `X-User-Id` / `X-User-Email` legacy | ✅ Levé | Ignorés en production (`isLegacyAuthAllowed`) ; frontend n'envoie plus ces headers |

---

## 3. Détail des mesures

### 3.1 Authentification obligatoire (K0-C02)

**Contrôleurs protégés** (`@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles`) :

| Route | Rôles autorisés |
|-------|-----------------|
| `GET /chantiers`, `GET /chantiers/:id`, `GET /chantiers/:id/history` | Direction, Assistante, Conducteur, Chef |
| `GET /chantiers/mine` | Chef |
| Onglets chantier (lecture / écriture) | Selon action (voir `projects.controller.ts`) |
| `GET /reserves`, `GET /photos` | Direction, Conducteur, Chef |
| `GET /dashboard/conducteur` | Conducteur |
| `GET /dashboard/direction` | Direction |
| `GET /users/assignable` | Conducteur |

**Sans JWT valide → `401 Unauthorized`.**

Fichiers clés :

- `backend/src/projects/projects.controller.ts`
- `backend/src/issues/issues.controller.ts`
- `backend/src/photos/photos.controller.ts`
- `backend/src/dashboard/dashboard.controller.ts`
- `backend/src/users/users.controller.ts`
- `backend/src/auth/guards/jwt-auth.guard.ts`
- `backend/src/auth/guards/roles.guard.ts`
- `backend/src/auth/constants/api-roles.ts`

### 3.2 Retrait mode legacy (K0-I04)

| Environnement | Comportement |
|---------------|--------------|
| `development`, `test` | `X-User-Id` / `X-User-Email` acceptés par `UserContextGuard` (rétrocompat tests locaux) |
| `production` | Headers legacy **ignorés** — JWT Bearer obligatoire |

Frontend : `apiClient.ts` n'envoie plus que `Authorization: Bearer <token>`.

### 3.3 JWT sécurisé (K0-C03)

Au démarrage (`main.ts`) :

1. **`assertJwtSecretConfigured`** — refuse le boot si `JWT_SECRET` absent ou vide.
2. **`assertJwtSecretStrength`** (production uniquement) :
   - minimum **32 caractères** ;
   - interdiction des valeurs par défaut listées (`replace-with-strong-secret-at-least-32-chars`, `changeme`, etc.).

`AuthModule` : plus de secret JWT codé en dur ; lecture exclusive de `JWT_SECRET`.

### 3.4 CORS restrictif (K0-C07)

Variable **`CORS_ORIGIN`** : liste d'origines séparées par des virgules.

| Exemple | Usage |
|---------|--------|
| `http://localhost:5173` | Développement local |
| `https://app.client.fr,https://recette.client.fr` | Production / recette |

Défaut si absent : `http://localhost:5173`.

Fichiers : `backend/src/config/cors.config.ts`, `backend/src/bootstrap/app-config.ts`.

### 3.5 Swagger (K0-I02)

| Condition | Swagger |
|-----------|---------|
| `NODE_ENV !== production` | Activé — `/api/docs`, `/api/docs-json` |
| `NODE_ENV=production` | **Désactivé** |
| `NODE_ENV=production` + `ENABLE_SWAGGER=true` | Activé (recette interne uniquement) |

---

## 4. Variables d'environnement ajoutées / modifiées

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `JWT_SECRET` | **Oui** | Secret HS256 — boot refusé si absent |
| `CORS_ORIGIN` | Non (défaut localhost) | Whitelist CORS |
| `ENABLE_SWAGGER` | Non | Force Swagger en production |
| `NODE_ENV` | Recommandé | `production` active les contrôles stricts |

Voir `backend/.env.example` et `.env.example`.

---

## 5. Tests — validation

### 5.1 Exécution (20/06/2026)

| Suite | Résultat |
|-------|----------|
| Frontend unitaires (Vitest) | ✅ 76 tests |
| Backend unitaires (Jest) | ✅ 38 tests |
| Backend E2E (Supertest) | ✅ 37 tests |
| E2E Playwright | ✅ 41 tests |
| Build FE + BE | ✅ OK |

```bash
npm run test:all   # unitaires FE + BE + E2E Playwright
cd backend && npm run test && npm run test:e2e
```

### 5.2 Cas de test sécurité K1

| ID | Description | Fichier |
|----|-------------|---------|
| T-K1-SEC-001 à 008 | Routes protégées sans JWT → 401 | `backend/test/security.e2e-spec.ts` |
| T-K1-SEC-009 | X-User-Id refusé en production | `backend/test/auth.e2e-spec.ts` |
| T-K1-RG-001 à 004 | Validation JWT secret + legacy | `backend/src/config/jwt-secret.validation.spec.ts` |
| T-K1-SWAGGER-001 | Swagger off en production | `backend/test/swagger.e2e-spec.ts` |
| — | RolesGuard | `backend/src/auth/guards/roles.guard.spec.ts` |

---

## 6. Documentation mise à jour

| Document | Contenu K1 |
|----------|------------|
| [08-DAT-v1.md](./08-DAT-v1.md) | Auth JWT, guards, CORS, Swagger prod |
| [API.md](./API.md) | Protection routes, Bearer obligatoire |
| [10-Guide-Exploitation.md](./10-Guide-Exploitation.md) | Checklist sécurité déploiement |
| [06-Cahier-de-tests.md](./06-Cahier-de-tests.md) | § Phase K1 |

---

## 7. Écarts K0 non traités en K1 (hors périmètre)

Les écarts infra / ops restent ouverts pour les phases K2–K5 :

- K0-C01 (HTTPS/TLS), K0-C04 (PostgreSQL), K0-C05 (Docker FE prod), K0-C06 (seed demo), K0-C08 (backup)
- K0-I01 (CI/CD), K0-I03 (rate limit login), K0-I05 à K0-I10

---

## 8. Checklist go-live sécurité applicative

- [x] Toutes les lectures métier exigent JWT + rôle
- [x] Pas de bypass `X-User-Id` en production
- [x] `JWT_SECRET` fort défini (≥ 32 car., hors liste interdite)
- [x] `CORS_ORIGIN` = domaine(s) frontend réel(s)
- [x] Swagger désactivé en production
- [ ] HTTPS terminé (K2 — infra)
- [ ] Mot de passe seed changé / comptes prod créés (K2)
- [ ] Rate limiting login (K2/K5)

---

## 9. Conclusion

La **Phase K1** lève les cinq écarts ciblés (**K0-C02, K0-C03, K0-C07, K0-I02, K0-I04**). L'API refuse désormais l'accès anonyme aux données métier, impose un secret JWT robuste au démarrage, restreint CORS et désactive Swagger en production.

**Prochaine étape recommandée :** Phase K2 — durcissement infra (TLS, PostgreSQL, Docker production, secrets ops).

---

*Rapport K1 — BatiNova — 20/06/2026*
