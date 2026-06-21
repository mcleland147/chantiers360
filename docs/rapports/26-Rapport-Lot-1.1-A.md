# Rapport de livraison — Lot 1.1-A (EVOL-001)

**Date :** 21/06/2026  
**Release :** 1.1.0 · **Lot :** 1.1-A uniquement  
**Statut :** Livré technique — **gate A recette MOA en attente**

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

## 2. CI

| Job | Résultat |
|-----|----------|
| `npm run ci:test` | ✅ OK |
| `npm run ci:build` | ✅ OK |
| `npm run ci:docker` | À valider post-merge (volume uploads ajouté) |

---

## 3. Fichiers principaux

| Zone | Fichiers |
|------|----------|
| BDD | `backend/prisma/migrations/0003_photo_upload_storage/` |
| Backend | `backend/src/storage/*`, `backend/src/photos/photos.service.ts` |
| API | `ProjectsController` upload, `PhotosController` file/delete |
| Frontend | `AddPhotoModal.tsx`, `AuthenticatedPhoto.tsx`, galeries |
| Ops | `docker-compose*.yml`, `scripts/backup-uploads.sh` |

---

## 4. Gate A — prochaines étapes

1. Recette MOA : REC-EVOL-001-01 à 05 (`docs/07-Cahier-Recette-Metier.md`)
2. Signature §5 fiche EVOL-001 si non faite
3. Tag intermédiaire optionnel : `v1.1.0-rc.A`
4. **GO lot 1.1-B** (EVOL-002) uniquement après validation gate A

---

*Rapport lot 1.1-A — Chantiers360 / BatiNova*
