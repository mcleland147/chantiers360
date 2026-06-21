# Rapport de livraison — Lot 1.1-A (EVOL-001)

**Date :** 21/06/2026  
**Release :** 1.1.0 · **Lot :** 1.1-A uniquement  
**Statut :** **Gate A validé** — Recette OK · GO lot 1.1-B

---

## 1. Périmètre livré

| Élément | Statut |
|---------|:------:|
| Migration `0003_photo_upload_storage` | ✅ |
| `StorageModule` + filesystem local | ✅ |
| Upload multipart JPG/PNG (10 Mo, 10 fichiers) | ✅ |
| `GET /photos/:id/file` authentifié | ✅ |
| `DELETE /photos/:id` soft delete + fichier | ✅ |
| Historisation ajout / suppression | ✅ |
| Frontend `AddPhotoModal`, galeries, mobile chef | ✅ |
| Volume Docker + variables `UPLOAD_*` | ✅ |
| Backup uploads documenté + script | ✅ |
| Tests automatisés TST-R11-A-01 → 09 | ✅ |

**Hors périmètre (respecté) :** EVOL-002, EVOL-003, migrations 0004–0006.

---

## 2. Gate A — critères

| Critère | Résultat | Date |
|---------|----------|------|
| `npm run ci:test` | ✅ OK | 21/06/2026 |
| `npm run ci:build` | ✅ OK | 21/06/2026 |
| `npm run ci:docker` (après `down -v`) | ✅ OK | 21/06/2026 |
| REC-EVOL-001-01 à 05 | ✅ OK | 21/06/2026 |
| EVOL-001 signée — statut Recette OK | ✅ OK | 21/06/2026 |

**Verdict gate A :** ✅ **GO lot 1.1-B** (EVOL-002 Planning)

---

## 3. CI — détail

| Job | Résultat |
|-----|----------|
| Frontend Vitest | 78 tests ✅ |
| Backend Jest unit | 42 tests ✅ |
| Backend API Supertest | 37 tests ✅ |
| Build FE + BE + Prisma | ✅ |
| Docker prod smoke (`https://localhost/api/health`) | ✅ |

Commande docker smoke : `docker compose -f docker-compose.prod.yml --env-file .env.ci down -v` puis `npm run ci:docker`.

---

## 4. Fichiers principaux

| Zone | Fichiers |
|------|----------|
| BDD | `backend/prisma/migrations/0003_photo_upload_storage/` |
| Backend | `backend/src/storage/*`, `backend/src/photos/photos.service.ts` |
| API | `ProjectsController` upload, `PhotosController` file/delete |
| Frontend | `AddPhotoModal.tsx`, `AuthenticatedPhoto.tsx`, galeries |
| Ops | `docker-compose*.yml`, `scripts/backup-uploads.sh` |
| Branche | `cursor/evol-001-upload-photos-lot-1.1-a` · commit `fcd016d` |

---

## 5. Prochaines étapes

1. Tag optionnel : `v1.1.0-rc.A`
2. **Lot 1.1-B** — EVOL-002 Planning ouvriers (autorisé)
3. Tag `v1.1.0` uniquement après lot C

---

*Rapport lot 1.1-A — Chantiers360 / BatiNova*
