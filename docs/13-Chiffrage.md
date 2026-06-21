# Chiffrage — Chantiers360 MVP & V2

**Version :** 1.0  
**Date :** 20/06/2026  
**Unité :** jours.homme (j/h) développeur full-stack senior  
**Hypothèse taux :** 550–700 €/j/h HT (fourchette marché ESN / indépendant France 2026 — à ajuster contrat)

---

## 1. Effort MVP réalisé (Phases A–I)

Estimation rétrospective alignée sur le périmètre livré et documenté.

| Phase | Périmètre | j/h estimés |
|-------|-----------|-------------|
| A–B | Socle React, layout, dashboard mock, KpiCard | 6 |
| C | Liste / détail chantiers, navigation | 5 |
| D | Onglets chantier (UI + permissions) | 8 |
| E | Auth mock → guards, routes rôles | 5 |
| F | Dashboard direction (règles + graphiques) | 6 |
| G | PostgreSQL, API chantiers, workflow, historique | 12 |
| G-TABS | API onglets + lecture fiche | 6 |
| G-TABS-FORMS | Modales écriture + mutations | 8 |
| Auth JWT | Login API, guards, E2E | 4 |
| H | Dashboards API, Swagger, seed 20, recette doc | 6 |
| I | DAT, guides, dossier recette, chiffrage | 3 |
| Transverse | Tests (166 auto), docs, Docker, Prisma 7 | 10 |
| **Total MVP** | | **~79 j/h** |

**Fourchette consolidée :** **75–85 j/h** (1 développeur ≈ 4 mois ; 2 développeurs ≈ 2–2,5 mois).

**Coût développement MVP (indicatif) :**

| Scénario | j/h | @ 600 €/j/h HT |
|----------|-----|----------------|
| Bas | 75 | 45 000 € |
| Médian | 80 | 48 000 € |
| Haut | 85 | 51 000 € |

*Hors MOA, design Figma, infra, recette métier client.*

---

## 2. Effort V2 estimé

| Lot | Items | j/h |
|-----|-------|-----|
| L1 — Prod & fichiers | Upload photo, stockage, CI/CD, Docker prod | 15–20 |
| L2 — Auth & sécurité | Refresh token, rate limit, durcissement | 8–10 |
| L3 — Mobile & notifs | Dashboard mobile API, notifications email/in-app | 12–15 |
| L4 — Workflow réserves | Règles clôture, assignation, cron alertes | 10–12 |
| L5 — Reporting | PDF + Excel + page Rapports | 12–15 |
| L6 — Monitoring & ops | Metrics, logs centralisés, runbooks | 6–8 |
| Tests & doc V2 | +30 % transverse | 15–18 |
| **Total V2** | | **78–98 j/h** |

**Fourchette V2 :** **80–100 j/h** → **48 000 – 60 000 € HT** @ 600 €/j/h.

---

## 3. Charges d’exploitation (récurrentes)

### 3.1 Environnement REC (client interne)

| Poste | Mensuel HT |
|-------|------------|
| VPS 2 vCPU / 4 Go (OVH, Scaleway) | 12–25 € |
| Nom de domaine + certificat Let’s Encrypt | ~1 € |
| Sauvegardes stockage externe | 5–10 € |
| **Total REC** | **~20–40 €/mois** |

### 3.2 Environnement PROD (PME BTP, ~30 utilisateurs)

| Poste | Mensuel HT |
|-------|------------|
| VPS ou cloud 4 vCPU / 8 Go | 40–80 € |
| PostgreSQL managé (option) | 30–60 € |
| Object storage photos (~50 Go) | 5–15 € |
| Monitoring / sauvegardes | 10–20 € |
| Support correctif (0,5 j/m) | 300 €* |
| **Total PROD infra seule** | **~85–175 €/mois** |
| **Total PROD + support light** | **~385–475 €/mois** |

\* Support : 0,5 j/h × 600 € — ajustable contrat SLA.

---

## 4. Hébergement cible recommandé

| Critère | REC | PROD |
|---------|-----|------|
| Hébergeur | OVH VPS / Scaleway | Idem ou Azure FR |
| OS | Ubuntu LTS | Ubuntu LTS |
| Runtime | Docker Compose | Docker Compose → K8s si > 100 users |
| BDD | PostgreSQL container | PostgreSQL managé ou VM dédiée |
| TLS | Caddy / Nginx + Let’s Encrypt | Obligatoire |
| RPO | 24 h | 4 h |
| RTO | 4 h | 2 h |

**Architecture minimale PROD :** 1 VM application (FE+BE) + 1 instance PostgreSQL (ou managée) + bucket objet photos.

---

## 5. Synthèse investissement client

| Poste | Montant indicatif HT |
|-------|----------------------|
| MVP réalisé (développement) | 45 000 – 51 000 € |
| V2 complète | 48 000 – 60 000 € |
| Mise en production initiale (infra + durcissement) | 5 000 – 8 000 € |
| Exploitation PROD (année 1, infra + support light) | ~5 000 – 6 000 €/an |

---

## 6. Hypothèses et exclusions

**Inclus dans les estimations :** développement, tests automatisés, documentation Phase I.

**Exclus :** licence Figma, ateliers MOA récurrents, formation utilisateurs sur site, migration données legacy, contrats support 24/7, audits sécurité tiers.

---

*Chiffrage indicatif — Phase I — à valider contractuellement — BatiNova*
