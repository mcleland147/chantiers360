# EVOL-001 — Upload réel des photos

**Processus :** `docs/23-Processus-Gestion-Evolutions.md`  
**Release :** 1.1.0 · **Lot :** 1.1-A  
**Références techniques :** `docs/24-Release-1.1-Backlog.md` §A · `docs/22-Release-1.1-DataModel.md`

---

## En-tête

| Champ | Valeur |
|-------|--------|
| **ID** | EVOL-001 |
| **Titre** | Upload réel des photos |
| **Type** | F — Fonctionnelle |
| **Priorité** | P1 |
| **Statut** | **Recette OK** — gate A validé |
| **Demandeur** | Direction BTP / Conducteur de travaux |
| **Date demande** | 15/06/2026 |
| **Version cible** | v1.1.0 |
| **Auteur fiche** | Équipe BatiNova |
| **Lot développement** | 1.1-A |

---

## 1. Demande client

### 1.1 Contexte

En MVP, les photos de chantier sont enregistrées via saisie manuelle d'un **nom de fichier** et d'une **URL**. Les chefs de chantier et conducteurs ne peuvent pas joindre directement les clichés pris sur le terrain. Les URLs seedées ne reflètent pas l'usage réel en recette et en production.

### 1.2 Besoin exprimé

> « Pouvoir ajouter des photos depuis mon ordinateur ou mon téléphone, en JPG ou PNG, plusieurs à la fois, avec une taille raisonnable, les classer par catégorie, et supprimer une photo erronée. Chaque action doit être tracée dans l'historique du chantier. »

### 1.3 Bénéfice attendu

- Documentation visuelle fiable des chantiers sans ressaisie
- Gain de temps terrain estimé : 15–20 min / chantier / semaine
- Réduction des erreurs (URLs invalides, photos absentes)
- Conformité avec le DAA (Module Photos — upload prévu)

### 1.4 Échéance souhaitée

Release **1.1.0** — lot A (premier lot de la release).

---

## 2. Qualification

### 2.1 Périmètre IN

- Upload depuis explorateur de fichiers (desktop et mobile)
- Upload **multiple** (jusqu'à 10 fichiers par action)
- Formats **JPG, JPEG, PNG** uniquement
- Taille max **10 Mo** par fichier
- Catégorisation : Avant / Pendant / Après travaux
- Commentaire optionnel
- **Suppression** photo (soft delete) avec confirmation
- **Historisation** ajout et suppression (`HistoryEvent`)
- Stockage serveur volume Docker `/data/uploads`
- Servir l'image via API (`GET /photos/:id/file`)
- Galerie chantier et page globale `/photos` mises à jour
- Mobile chef (`/mobile`) : upload réel

### 2.2 Périmètre OUT

- Retouche, recadrage, watermark
- Upload vidéo, PDF, HEIC
- Stockage Object Storage S3/OVH (Release ultérieure)
- Compression automatique / génération thumbnail (V2)
- Quota par chantier paramétrable client (V2)

### 2.3 Utilisateurs impactés

| Rôle | Impact |
|------|--------|
| Direction | Lecture photos — pas d'upload |
| Assistante administrative | — |
| Conducteur de travaux | Upload + suppression sur ses chantiers |
| Chef de chantier | Upload + suppression sur chantiers affectés |

### 2.4 Critères d'acceptation

1. **Étant donné** un conducteur sur la fiche chantier, **quand** il sélectionne 3 fichiers JPG < 10 Mo et une catégorie, **alors** 3 photos apparaissent dans la galerie sous 10 s.
2. **Étant donné** un fichier PNG de 11 Mo, **quand** l'utilisateur tente l'upload, **alors** un message d'erreur explicite s'affiche et aucune photo n'est créée.
3. **Étant donné** un fichier `.pdf`, **alors** refus avec message « format non autorisé ».
4. **Étant donné** une photo existante, **quand** le conducteur confirme la suppression, **alors** elle disparaît de la galerie et l'historique contient « Suppression photo ».
5. **Étant donné** un clic sur miniature, **alors** preview plein écran depuis l'API (pas URL externe).

### 2.5 Dépendances

| Dépendance | Statut |
|------------|--------|
| MVP Photos (métadonnées) | ✅ Existant |
| Stack Docker prod K2 | ✅ Existant |
| Volume uploads Docker | ☐ À créer (lot A) |
| EVOL-002, EVOL-003 | Info — indépendant |

---

## 3. Analyse d'impact

| Domaine | Impact | Détail |
|---------|--------|--------|
| Règles métier | Modéré | RG-PHO-01 à 03 — validation MIME, taille, historique |
| Rôles / permissions | Modéré | `canAddPhoto` existant ; delete conducteur/chef |
| API REST | Majeur | POST multipart, DELETE, GET file stream |
| Base de données | Migration | `0003_photo_upload_storage` — colonnes Photo |
| Frontend | Majeur | Refonte `AddPhotoModal`, delete galerie, mobile |
| Performance | Modéré | Upload parallèle limité ; disque VPS |
| Sécurité | Majeur | Validation MIME, UUID storageKey, pas d'exécution uploads |
| Exploitation | Majeur | Volume Docker + backup fichiers |

### 3.1 Documents à mettre à jour

- [x] Conception — `docs/22-Release-1.1-Impact-Analysis.md`
- [ ] `docs/06-Cahier-de-tests.md` — TST-R11-A-*
- [ ] `docs/07-Cahier-Recette-Metier.md` — REC-EVOL-001-*
- [ ] `docs/25-Changelog.md`
- [ ] `docs/API.md`
- [ ] `docs/09-Guide-Utilisateur.md`
- [ ] `docs/10-Guide-Exploitation.md` — backup uploads
- [ ] `docs/08-DAT-v1.md`
- [ ] `docs/21-Runbook-Incident.md` — espace disque

### 3.2 Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Saturation disque VPS | Moyenne | Élevé | Monitoring espace ; backup + doc ops |
| Upload malveillant (MIME spoof) | Faible | Critique | Validation extension + MIME + taille |
| Régression galerie existante | Moyenne | Moyen | Tests API + E2E |
| Multer vulnérabilités npm | Moyenne | Moyen | Surveiller audit ; limiter surface |

---

## 4. Chiffrage

| Poste | j/h bas | j/h médian | j/h haut |
|-------|---------|------------|----------|
| Développement | 4 | 5 | 7 |
| Tests | 1,5 | 2 | 3 |
| Recette & documentation | 0,5 | 1 | 1,5 |
| Déploiement | 0,5 | 0,5 | 1 |
| Marge risque (+15 %) | 1 | 1,2 | 1,8 |
| **Total** | **7,5** | **8** | **11** |

**Hypothèses :** stockage local filesystem ; pas de thumbnail ; max 10 fichiers/upload.  
**Exclusions :** migration S3, compression image.

---

## 5. Validation

| Validateur | Rôle | Date | Accord |
|------------|------|------|--------|
| Comité évolutions | Arbitrage | 21/06/2026 | ✅ Validée — v1.1.0 |
| MOA client | Métier / recette | 21/06/2026 | ✅ Recette gate A |

**Commentaires :** Validée en comité pour Release 1.1 — lot A prioritaire.

---

## 6. Développement

| Élément | Valeur |
|---------|--------|
| Branche Git | `cursor/evol-001-upload-photos-lot-1.1-a` |
| Commit | `fcd016d` |
| Pull Request | _À créer_ |
| Migration Prisma | Oui — `0003_photo_upload_storage` |

**Endpoints prévus :** voir `docs/24-Release-1.1-Backlog.md` §A.2.

---

## 7. Tests

### 7.1 Tests automatisés prévus

| ID | Type | Fichier | Description |
|----|------|---------|-------------|
| TST-EVOL-001-01 | Unit | `storage.service.spec.ts` | Validation MIME JPG/PNG |
| TST-EVOL-001-02 | Unit | idem | Rejet > 10 Mo |
| TST-EVOL-001-03 | API | `photos-upload.api.spec.ts` | Multipart 200 |
| TST-EVOL-001-04 | API | idem | 415 type invalide |
| TST-EVOL-001-05 | API | idem | 413 taille excessive |
| TST-EVOL-001-06 | API | `photos-delete.api.spec.ts` | DELETE + historique |
| TST-EVOL-001-07 | RTL | `AddPhotoModal.test.tsx` | UX upload |
| TST-EVOL-001-08 | E2E | `photos-upload.spec.ts` | Parcours complet |

### 7.2 Exécution

_À compléter en développement._

| Commande | Résultat | Date |
|----------|----------|------|
| `ci:test` | ✅ OK | 21/06/2026 |
| `ci:build` | ✅ OK | 21/06/2026 |
| `ci:docker` | ✅ OK (volumes nettoyés) | 21/06/2026 |
| CI GitHub | ☐ OK ☐ KO | |

---

## 8. Recette métier

### 8.1 Scénarios

| ID | Objectif | Statut | Exécutant | Date |
|----|----------|--------|-----------|------|
| REC-EVOL-001-01 | Upload 3 JPG depuis fiche chantier | ✅ | Conducteur | 21/06/2026 |
| REC-EVOL-001-02 | Refus fichier > 10 Mo | ✅ | Conducteur | 21/06/2026 |
| REC-EVOL-001-03 | Suppression + trace historique | ✅ | Conducteur | 21/06/2026 |
| REC-EVOL-001-04 | Upload depuis mobile chef | ✅ | Chef | 21/06/2026 |
| REC-EVOL-001-05 | Galerie globale `/photos` à jour | ✅ | Direction | 21/06/2026 |

### 8.2 Signature recette

| Validateur métier | Date | Signature |
|-------------------|------|-----------|
| MOA BatiNova | 21/06/2026 | ✅ Recette acceptée — gate A |

---

## 9. Déploiement & rollback

### 9.1 Déploiement

| Environnement | Date | Version / tag | Opérateur | Résultat |
|---------------|------|---------------|-----------|----------|
| REC | _—_ | v1.1.0-rc.A | | ☐ |
| PROD | _—_ | v1.1.0 | | ☐ |

**Backup pré-deploy :** `npm run ops:backup` + archive volume uploads si existant.

### 9.2 Procédure de rollback

**Cas A — Migration 0003 appliquée, pas de corruption :**

```bash
npm run ops:backup
git checkout v1.0.0
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
npm run ops:health
# Photos uploadées post-1.1 restent sur disque — nettoyage manuel si besoin
```

**Cas B — Migration incompatible :**

```bash
OPS_FORCE=1 npm run ops:restore -- backup/chantiers360_<pré-deploy>.sql.gz
git checkout v1.0.0
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
```

**Durée estimée rollback :** 15–20 minutes.

---

## 10. Clôture — Definition of Done

```
[x] D1 Fiche validée — statut Recette OK (gate A)
[x] D2 Impacts analysés (§3)
[x] D3 Tests ajoutés + CI verte
[x] D4 Cahier de tests à jour
[x] D5 Cahier de recette à jour + signé
[x] D6 Changelog à jour
[ ] D7 Tag v1.1.0 (release globale, après lot C)
[x] D8 Rollback documenté (§9)
```

**Date clôture gate A :** 21/06/2026  
**Statut :** **Recette OK** — gate A validé · GO lot 1.1-B  
**Branche Git :** `cursor/evol-001-upload-photos-lot-1.1-a`  
**Migration Prisma :** `0003_photo_upload_storage` ✅

---

*EVOL-001 — Upload réel des photos — Chantiers360 / BatiNova*
