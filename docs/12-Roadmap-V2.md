# Roadmap V2 — Chantiers360

**Version :** 1.0  
**Date :** 20/06/2026  
**Horizon :** Post-MVP / post-recette client

---

## 1. Vision V2

Consolider Chantiers360 en **produit exploitable en production** : stockage fichiers réel, expérience mobile terrain, notifications, reporting exportable, sécurité renforcée et observabilité.

---

## 2. Backlog priorisé

| Priorité | ID | Thème | Description | Dépendances |
|----------|-----|-------|-------------|-------------|
| **P1** | V2-UPLOAD | Upload photo réel | Upload binaire, validation type/taille, stockage local ou S3/MinIO, URL persistée | DAT stockage |
| **P1** | V2-AUTH | Refresh token | Access + refresh, invalidation logout, rotation secrets | Auth |
| **P1** | V2-CI | CI/CD + prod Docker | Pipeline GitHub Actions, image frontend Nginx, déploiement automatisé | DAT §7 |
| **P2** | V2-MOBILE | Dashboard mobile chef | Données API réelles, UX terrain optimisée, offline partiel (option) | Upload |
| **P2** | V2-NOTIF | Notifications | Email / in-app : retards, réserves critiques, assignations | Alertes cron |
| **P2** | V2-RESERVES | Workflow réserves complet | États, assignation, clôture chantier bloquée si réserves ouvertes | RG métier |
| **P3** | V2-PDF | Rapports PDF | Synthèse chantier, état réserves, export direction | Reporting API |
| **P3** | V2-EXCEL | Export Excel | Listes chantiers, réserves, KPI période | Dashboard API |
| **P3** | V2-MONITOR | Monitoring | Prometheus/Grafana ou équivalent, alerting health + erreurs | Infra PROD |
| **P4** | V2-CRON | Alertes planifiées | Job nocturne retards, table `Alert` synchronisée | PostgreSQL |
| **P4** | V2-REPORTS | Module Rapports UI | Écran `/reports` connecté API | PDF/Excel |

---

## 3. Jalons suggérés

```
T0 ─ MVP livré (Phases A–H + I)
 │
 ├─ M1 (4–6 sem.) ─ V2-UPLOAD + V2-AUTH + V2-CI + prod hardening
 │
 ├─ M2 (4 sem.) ─── V2-MOBILE + V2-NOTIF + V2-RESERVES
 │
 └─ M3 (4 sem.) ─── V2-PDF + V2-EXCEL + V2-MONITOR
```

---

## 4. Critères de sortie V2

- Upload photo testé E2E avec fichier réel
- Refresh token + tests sécurité
- Pipeline CI vert sur chaque PR
- Monitoring PROD avec alerting
- Documentation DAT v2 mise à jour
- Campagne recette V2 (extension cahier REC)

---

## 5. Hors périmètre V2 (V3+)

- Rôle Administrateur / multi-tenant
- Intégration ERP / comptabilité
- Signature électronique PV réception
- Application native iOS/Android
- BI avancée (Power BI embed)

---

*Roadmap V2 — Phase I — BatiNova*
