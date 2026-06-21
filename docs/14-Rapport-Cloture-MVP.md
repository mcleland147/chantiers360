# Rapport de clôture MVP — Chantiers360

**Date :** 20/06/2026  
**Phase :** J — Complétude MVP  
**Statut :** MVP fonctionnel — prêt pour Phase K (Production Ready)

---

## 1. Fonctionnalités réalisées

| Domaine | Livrable | Statut |
|---------|----------|--------|
| Authentification | JWT login, `/auth/me`, guards rôle | ✅ |
| Chantiers | CRUD, workflow ±1, historisation | ✅ |
| Affectations | Conducteur → équipe | ✅ |
| Avancement | Commentaire + % | ✅ |
| Réserves | OUVERTE → EN_COURS → LEVEE (Phase J) | ✅ |
| Clôture chantier | Blocage REC-013 si réserves ouvertes | ✅ |
| Photos | Ajout URL, galerie fiche + globale | ✅ |
| Dashboards | Conducteur + Direction (API) | ✅ |
| Vues globales | `/reserves`, `/photos` avec filtres | ✅ |
| Mobile chef | `/mobile` API réelle, actions terrain | ✅ |
| Documentation | DAT, guides, cahier recette, chiffrage | ✅ |
| Swagger | `/api/docs` | ✅ |

---

## 2. Fonctionnalités non retenues (hors MVP)

| Fonctionnalité | Raison |
|----------------|--------|
| Rôle Administrateur | Hors périmètre SPEC MVP |
| Rapports PDF / Excel | Reporté V2 |
| Upload photo binaire | Reporté V2 |
| Refresh token JWT | Reporté V2 |
| Notifications push | Reporté V2 |
| Cron alertes automatiques | Calcul à la volée suffisant MVP |
| Pages `/reports`, `/admin` | Placeholders |

---

## 3. Écarts connus

| # | Écart | Impact | Phase cible |
|---|-------|--------|-------------|
| E1 | Upload photo = URL seulement | Faible en REC | V2 M1 |
| E2 | Token JWT 15 min sans refresh | Reconnexion manuelle | V2 |
| E3 | CI/CD non commité | Pas de pipeline auto | K |
| E4 | Docker frontend mode dev Vite | Non prod-ready | K |
| E5 | Chemins API vs DAA (`/dashboard/*`, `/reserves` global) | Documenté DAT | Accepté |
| E6 | TopBar fiche chantier = titre générique | Cosmétique | K |
| E7 | Filtre auteur photos côté client (global) | Performance si volume | V2 |

---

## 4. Dettes techniques restantes

1. **Pipeline CI/CD** — modèle YAML dans DAT, à versionner (`.github/workflows/ci.yml`)
2. **Frontend production** — Dockerfile Nginx, variables d'environnement build
3. **Secrets & TLS** — JWT secret, CORS restreint, HTTPS
4. **Sauvegardes automatisées** — `pg_dump` cron documenté, non déployé
5. **Tests E2E contre API réelle** — suite actuelle mockée Playwright (déterministe CI)
6. **Mobile layout dédié** — bottom nav SPEC §5.9 partiellement couvert (actions OK, pas de MobileLayout séparé)
7. **Fichiers mock test** — `mockChantiers.ts`, `mockDashboard.ts` conservés pour tests/E2E uniquement

---

## 5. Fonctionnalités reportées en V2

Voir [`docs/12-Roadmap-V2.md`](12-Roadmap-V2.md) :

- Upload photo réel (multipart/S3)
- Dashboard mobile enrichi
- Notifications (email/push)
- Workflow réserves avancé (réassignation, commentaires)
- Rapports PDF et export Excel
- Refresh token + logout API
- Monitoring (Prometheus/Grafana)

---

## 6. Résultats tests Phase J

| Suite | Résultat |
|-------|----------|
| Frontend (Vitest) | **76** ✅ |
| Backend unit (Jest) | **30** ✅ |
| Backend API (Supertest) | **27** ✅ |
| E2E Playwright | **41** ✅ (mocks — exécution locale) |
| Build frontend | ✅ |
| Build backend | ✅ |

Nouveaux tests Phase J : T-J-RG-001/002, T-J-API-001, T-J-COMP-001/002, E2E-J-RSV/PHO/MOB-001.

---

## 7. Recommandation — démarrage Phase K (Production Ready)

### Priorité immédiate (Sprint K1)

1. **Commit CI/CD** — lint + test + build sur push/PR
2. **Docker prod** — multi-stage frontend Nginx, secrets via env
3. **Durcissement sécurité** — CORS, rate limit login, JWT secret fort
4. **Sauvegarde PostgreSQL** — script cron + procédure restore testée
5. **Environnement REC dédié** — déploiement staging client

### Priorité court terme (Sprint K2)

6. **Refresh token** — confort utilisateur prod
7. **Upload photo binaire** — premier lot V2 en prod
8. **Monitoring basique** — healthcheck + logs structurés
9. **Campagne recette finale** — REC-001 à REC-015 sur env REC

### Critères de passage prod

- [ ] CI verte sur main
- [ ] Build Docker prod validé
- [ ] TLS actif
- [ ] Sauvegarde restore testée
- [ ] Cahier recette REC validé à 100 %
- [ ] DAT v1 aligné post-K

---

## 8. Synthèse

Le MVP Chantiers360 couvre l'intégralité du périmètre fonctionnel défini (phases A–J). Les placeholders `/reports` et `/admin` restent hors scope. La Phase K peut démarrer sur la base de ce rapport et du [`DAT v1`](08-DAT-v1.md).
