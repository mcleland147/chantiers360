# API Chantiers360 — Chantiers (Phase G)

Base URL : `http://localhost:3000/api`

## Authentification (T-API-AUTH)

### `POST /auth/login`

Connexion par email + mot de passe (hash bcrypt en base).

**Corps** :

```json
{
  "email": "conducteur@batinova.fr",
  "password": "demo123"
}
```

**Réponse 200** :

```json
{
  "token": "<JWT>",
  "user": {
    "id": "u-conducteur",
    "firstName": "Marc",
    "lastName": "Dupont",
    "email": "conducteur@batinova.fr",
    "role": "CONDUCTEUR_TRAVAUX"
  }
}
```

**Erreurs** : `401` — identifiants incorrects ou compte inactif.

### `GET /auth/me`

Profil de l'utilisateur connecté. **JWT requis** (`Authorization: Bearer <token>`).

**Réponse 200** : objet `user` (même forme que ci-dessus, sans token).

### Protection des routes

**Toutes les routes métier** (lectures et mutations) exigent un JWT valide :

```
Authorization: Bearer <JWT>
```

| Méthode | Exigence |
|---------|----------|
| **Production** | JWT Bearer **obligatoire** |
| Développement / test | JWT Bearer (recommandé) ; headers legacy `X-User-Id` / `X-User-Email` acceptés par `UserContextGuard` pour rétrocompatibilité locale |

Le frontend envoie uniquement le Bearer token depuis la session (`apiClient`).

**Sans token ou token invalide → `401 Unauthorized`.**  
**Rôle insuffisant → `403 Forbidden`.**

**JWT** : signé HS256, payload `{ sub, email, role }`, expiration configurable (`JWT_EXPIRES_IN`, défaut `15m`).

**Démarrage API** : `JWT_SECRET` obligatoire ; en `NODE_ENV=production`, secret ≥ 32 caractères et hors liste de valeurs par défaut interdites.

**Comptes seedés** (mot de passe `demo123`) :

| Email | Rôle |
|-------|------|
| direction@batinova.fr | DIRECTION |
| assistante@batinova.fr | ASSISTANTE_ADMINISTRATIVE |
| conducteur@batinova.fr | CONDUCTEUR_TRAVAUX |
| chef@batinova.fr | CHEF_CHANTIER |
| paul.lefevre@batinova.fr | CHEF_CHANTIER |
| sophie.martin@batinova.fr | CONDUCTEUR_TRAVAUX |
| luc.bernard@batinova.fr | CONDUCTEUR_TRAVAUX |

### Routes protégées (Phase K1)

| Route | JWT | Rôles |
|-------|-----|-------|
| `GET /chantiers`, `GET /chantiers/:id`, `GET /chantiers/:id/history` | Oui | Direction, Assistante, Conducteur, Chef |
| `GET /chantiers/mine` | Oui | Chef |
| Onglets chantier | Oui | Selon action |
| `GET /reserves`, `GET /photos` | Oui | Direction, Conducteur, Chef |
| `GET /dashboard/*` | Oui | Conducteur ou Direction |
| `GET /users/assignable` | Oui | Conducteur |
| Mutations | Oui | Selon action |

## Documentation Swagger (Phase H / K1)

- **UI interactive** : `http://localhost:3000/api/docs` (hors production)
- **OpenAPI JSON** : `http://localhost:3000/api/docs-json`

**Production :** Swagger désactivé par défaut. Variable `ENABLE_SWAGGER=true` pour recette interne uniquement.

Documente : auth, chantiers, dashboards, DTO et codes erreur principaux.

## Dashboards (Phase H)

### `GET /dashboard/conducteur`

Tableau de bord conducteur. **JWT requis — rôle CONDUCTEUR_TRAVAUX.**

Filtre automatique sur les chantiers du conducteur connecté.

**Réponse 200** :

```json
{
  "kpis": {
    "activeChantiers": 8,
    "lateChantiers": 2,
    "openReserves": 5,
    "criticalReserves": 2
  },
  "alerts": [{ "type": "RETARD_CHANTIER", "chantierReference": "CHT-003", "..." : "..." }],
  "recentChantiers": [],
  "recentReserves": []
}
```

### `GET /dashboard/direction`

Vue consolidée direction. **JWT requis — rôle DIRECTION.**

**Réponse 200** : KPI portefeuille, `atRiskChantiers`, `statusDistribution`, `conductorDistribution`, `monthlyTrend`, `budget`.

**Erreurs** : `403` — rôle non autorisé.

## Jeu de données recette (Phase H)

Seed : 20 chantiers (`CHT-001` … `CHT-020`), tous statuts workflow, 3 conducteurs, réserves ouvertes/critiques, photos, historique, alertes, chantiers en retard (CHT-003, CHT-006, CHT-018).

Commande : `npm run prisma:seed --prefix backend`

## Règles métier data

| ID | Règle |
|----|-------|
| RG-DATA-001 | Référence unique format `CHT-XXX` + champs obligatoires |
| RG-DATA-002 | Statut initial `Préparation` à la création |
| RG-DATA-003 | Transition workflow ±1 étape uniquement |
| RG-DATA-004 | Motif obligatoire en retour arrière de statut |

## Endpoints chantiers

### `GET /chantiers`

Liste tous les chantiers.

**Réponse 200** : tableau de chantiers (statuts en français).

### `GET /chantiers/:id`

Détail d'un chantier.

### `POST /chantiers`

Crée un chantier. **Auth requise.**

```json
{
  "reference": "CHT-099",
  "name": "Nom du chantier",
  "client": "Client",
  "address": "Adresse complète",
  "conductorId": "u-conducteur",
  "startDate": "2025-01-01",
  "expectedEndDate": "2025-12-31",
  "budget": 500000
}
```

**Réponse 201** : chantier créé (statut `Préparation`).

**Erreurs** :
- `400` + `ruleCode: RG-DATA-001` — validation
- `409` — référence déjà existante

### `PATCH /chantiers/:id`

Met à jour un chantier. **Auth requise.**

### `PATCH /chantiers/:id/status`

Change le statut (workflow). **Auth requise.**

```json
{
  "status": "Démarrage",
  "reason": "Motif si retour arrière"
}
```

**Erreurs** :
- `400` + `ruleCode: RG-DATA-003` — transition invalide
- `400` + `ruleCode: RG-DATA-004` — motif manquant

### `GET /chantiers/:id/history`

Historique des événements du chantier (lecture seule).

## Onglets fiche chantier (T-G-TABS)

### `GET /chantiers/:id/assignments`

Liste des affectations équipe (collaborateur, fonction, date, actif/inactif).

### `POST /chantiers/:id/assignments`

Affecte un membre. **Auth requise — conducteur uniquement.**

```json
{
  "userId": "u-chef",
  "functionLabel": "Chef de chantier"
}
```

Historise : `Affectation équipe`.

### `GET /chantiers/:id/progress`

Journal d'avancement (date, auteur, commentaire, pourcentage optionnel).

### `POST /chantiers/:id/progress`

Ajoute une mise à jour. **Auth requise — conducteur ou chef de chantier.**

```json
{
  "comment": "Commentaire obligatoire",
  "percent": 67
}
```

**Erreurs** :
- `400` + `ruleCode: RG-TABS-001` — commentaire manquant
- `400` + `ruleCode: RG-TABS-002` — pourcentage invalide

Historise : `Mise à jour avancement`.

### `GET /chantiers/:id/reserves`

Liste des réserves du chantier (référence, titre, priorité, statut, assigné, date).

### `POST /chantiers/:id/reserves`

Crée une réserve. **Auth requise — conducteur ou chef de chantier.**

```json
{
  "title": "Fissure mur porteur nord",
  "description": "Description optionnelle",
  "priority": "Critique"
}
```

Priorités : `Faible`, `Moyenne`, `Haute`, `Critique`.

Historise : `Création réserve`.

### `PATCH /chantiers/:id/reserves/:reserveId/levee`

Valide la levée d'une réserve « En cours ». **Auth requise — conducteur uniquement.**

**Erreurs** :
- `400` + `ruleCode: RG-TABS-004` — statut incompatible

Historise : `Levée réserve validée`.

### `PATCH /chantiers/:id/reserves/:reserveId/prise-en-charge`

Prend en charge une réserve « Ouverte » (→ En cours). **Auth requise — conducteur ou chef.**

**Erreurs** :
- `400` + `ruleCode: RG-TABS-008` — statut incompatible

Historise : `Prise en charge réserve`. Renseigne `assignedToId`, `takenAt`.

### `GET /reserves`

Liste globale des réserves avec filtres. **Auth requise — Direction, Conducteur, Chef.**

Query : `search`, `status`, `priority`, `chantierId`, `assigneeId`.

Périmètre par rôle : conducteur = ses chantiers ; chef = chantiers affectés ; direction = tous.

### `GET /photos`

Galerie globale. **Auth requise — Direction, Conducteur, Chef.**

Query : `chantierId`, `category`, `authorId`. Tri chronologique décroissant.

### `GET /chantiers/mine`

Chantiers affectés à l'utilisateur connecté (chef de chantier). **Auth requise.**

### `GET /chantiers/:id/photos`

Photothèque (catégorie MVP, nom fichier, auteur, date, commentaire).

### `POST /chantiers/:id/photos`

Ajoute une photo (métadonnées — pas d'upload binaire en MVP). **Auth requise — conducteur ou chef.**

```json
{
  "fileName": "facade-sud.jpg",
  "category": "Pendant travaux",
  "comment": "Optionnel",
  "fileUrl": "/uploads/facade-sud.jpg"
}
```

Catégories : `Avant travaux`, `Pendant travaux`, `Après travaux`.

Historise : `Ajout photo`.

## Règles métier onglets

| ID | Règle |
|----|-------|
| RG-TABS-001 | Commentaire avancement obligatoire |
| RG-TABS-002 | Pourcentage avancement 0–100 entier |
| RG-TABS-003 | Titre et priorité réserve obligatoires |
| RG-TABS-004 | Levée réservée aux réserves « En cours » |
| RG-TABS-005 | Nom fichier et catégorie photo obligatoires |
| RG-TABS-006 | Collaborateur et fonction obligatoires à l'affectation |

Permissions alignées frontend (`chantierPermissions.ts`) — vérifiées côté API via rôle utilisateur.

### `GET /users/assignable`

Liste des utilisateurs affectables (hors Direction), pour le formulaire d'affectation équipe.

**Réponse 200** : `[{ id, firstName, lastName, fullName, role }]`

## Formulaires onglets (T-G-TABS-FORMS)

Les POST documentés ci-dessus alimentent les modales frontend :

| Onglet | Modal | Rôle UI | Endpoint |
|--------|-------|---------|----------|
| Équipes | Affecter un membre | Conducteur | `POST …/assignments` |
| Avancement | Ajouter une mise à jour | Conducteur, Chef | `POST …/progress` |
| Réserves | Nouvelle réserve | Conducteur, Chef | `POST …/reserves` |
| Photos | Ajouter une photo (URL MVP) | Conducteur, Chef | `POST …/photos` |

Après création, le frontend invalide le cache React Query de l'onglet et l'historique chantier.

## Démarrage local

```bash
docker compose up -d postgres
cd backend && cp .env.example .env
# DATABASE_URL=postgresql://chantiers360:chantiers360@localhost:5432/chantiers360?schema=public
npm run prisma:deploy && npm run prisma:seed
npm run start:dev
```

## Seed

Comptes alignés frontend : `conducteur@batinova.fr` / `demo123` (id `u-conducteur`).

Chantier seed : `CHT-001` — Résidence Les Oliviers, `CHT-003` — Immeuble Haussmann (onglets peuplés).
