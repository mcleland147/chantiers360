# Runbook incident — Chantiers360

**Version :** 1.0 (Phase K4)  
**Date :** 20/06/2026  
**Public :** Exploitants, support N2, astreinte  
**Références :** [`10-Guide-Exploitation.md`](10-Guide-Exploitation.md), [`20-Rapport-K4-Exploitation.md`](20-Rapport-K4-Exploitation.md)

---

## 1. Classification des incidents

| Niveau | Définition | Délai prise en charge | Exemples |
|--------|------------|------------------------|----------|
| **P1 — Critique** | Application indisponible pour tous les utilisateurs | < 15 min | Stack down, BDD corrompue, perte données |
| **P2 — Majeur** | Fonctionnalité métier bloquante partielle | < 1 h | Login impossible, mutations en échec massif |
| **P3 — Mineur** | Dégradation limitée, contournement possible | < 4 h | Lenteur, erreur isolée, alerte monitoring |

---

## 2. Contacts (à compléter client)

| Rôle | Contact | Disponibilité |
|------|---------|---------------|
| Astreinte applicative | — | — |
| Astreinte infra / VPS | — | — |
| DBA / sauvegardes | — | — |
| Direction projet | — | Heures ouvrées |

---

## 3. Diagnostic rapide (tous niveaux)

```bash
# 1. État stack Docker prod
docker compose -f docker-compose.prod.yml --env-file .env.prod ps

# 2. Healthcheck automatisé
npm run ops:health
# ou JSON : OPS_HEALTH_JSON=1 npm run ops:health

# 3. Logs récents
docker compose -f docker-compose.prod.yml --env-file .env.prod logs --tail 100 backend caddy postgres

# 4. Vérification complète REC (si stack up)
npm run prod:verify
```

**Endpoint de référence :** `GET https://<domaine>/api/health` → `{"status":"ok",…}`

---

## 4. P1 — Application indisponible

### 4.1 Symptômes

- `check-health.sh` en échec ou sonde externe DOWN
- Navigateur : erreur 502/503 ou timeout
- Containers `backend`, `caddy` ou `postgres` en `unhealthy` / `Exited`

### 4.2 Actions immédiates

1. **Confirmer** l'incident (`npm run ops:health`)
2. **Consulter** logs backend et postgres (§3)
3. **Redémarrer** le service fautif :

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod restart backend
# si échec :
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

4. **Si postgres corrompu ou migration échouée** → §5 (restauration BDD)
5. **Communiquer** aux utilisateurs (P1) — canal défini client
6. **Documenter** : heure début/fin, cause, actions (modèle §8)

### 4.3 Escalade

- Redémarrage sans effet → restauration backup < 4 h (RTO DAT)
- Perte données confirmée → P1 + direction + restore immédiat

---

## 5. P1 — Restauration base de données

**Prérequis :** backup récent (`backup/chantiers360_*.sql.gz`)

```bash
# Lister les backups
ls -lt backup/

# Restauration (confirmation interactive)
npm run ops:restore -- backup/chantiers360_YYYYMMDD_HHMMSS.sql.gz

# Automatisé (scripts / CI interne)
OPS_FORCE=1 npm run ops:restore -- backup/chantiers360_YYYYMMDD_HHMMSS.sql.gz
```

**Post-restore :**

1. `npm run ops:health`
2. Test login conducteur (REC) ou compte prod
3. Vérifier échantillon chantiers / réserves

**Si aucun backup :** réinitialisation REC uniquement (`npm run prod:seed` après stack vide) — **interdit en PROD sans validation direction**.

---

## 6. P2 — Login / authentification

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| 401 sur toutes routes | `JWT_SECRET` changé | Aligner secret + reconnexion utilisateurs |
| 401 après 15 min | Token expiré (normal) | Reconnexion |
| 500 au login | BDD inaccessible | Vérifier postgres + logs backend |
| CORS navigateur | `CORS_ORIGIN` incorrect | Corriger `.env.prod`, rebuild si besoin |

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod exec backend \
  curl -fsS http://127.0.0.1:3000/api/health
```

---

## 7. P2 — Déploiement raté / rollback

1. **Ne pas paniquer** — conserver logs du déploiement
2. **Sauvegarder** la BDD avant toute action : `npm run ops:backup`
3. **Rollback image** : redeploy tag/commit précédent (`git checkout <tag>` ou `docker compose pull` version antérieure)
4. **Si migration Prisma incompatible** : restore backup (§5)
5. **Vérifier** : `npm run prod:verify`

---

## 8. P3 — Lenteur / alerte monitoring

1. Vérifier charge VPS (`htop`, `docker stats`)
2. Taille disque : `df -h` + volume Docker postgres
3. Logs rotation OK (max 5×10 Mo par service — K4)
4. Redémarrer backend si fuite mémoire suspectée
5. Planifier analyse approfondie (hors astreinte)

---

## 9. Modèle compte-rendu incident

| Champ | Valeur |
|-------|--------|
| ID incident | INC-YYYYMMDD-NN |
| Niveau | P1 / P2 / P3 |
| Début / fin | |
| Détecté par | Monitoring / utilisateur / ops |
| Impact | Nombre utilisateurs, fonctions touchées |
| Cause racine | |
| Actions correctives | |
| Actions préventives | |
| Backup utilisé (si restore) | Fichier + date backup |

---

## 10. Prévention (checklist ops)

| Fréquence | Action |
|-----------|--------|
| Quotidien | Cron `scripts/backup-db.sh` (2h) |
| Hebdo | Test restore sur env REC + `npm run ops:health` |
| 5 min | Cron `scripts/check-health.sh` ou sonde UptimeRobot |
| À chaque deploy | `npm run ops:backup` avant migration |

---

*Runbook incident — Phase K4 — BatiNova / Chantiers360*
