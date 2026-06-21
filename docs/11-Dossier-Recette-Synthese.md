# Dossier de recette — Synthèse Chantiers360 MVP

**Version :** 1.0  
**Date :** 20/06/2026  
**Statut global :** ✅ **Prêt pour campagne recette métier** (automatisé validé ; manuel à exécuter)

---

## 1. Objectif

Synthétiser la **couverture fonctionnelle**, les **résultats des tests automatisés** et le **statut du cahier de recette métier** avant livraison client.

**Références :**

- Cahier recette détaillé : `docs/07-Cahier-Recette-Metier.md`
- Cahier tests : `docs/06-Cahier-de-tests.md`
- Spec UI : `docs/SPEC-UI-MVP.md`
- DAA / DAT : `DAA - Chantiers360.txt`, `docs/08-DAT-v1.md`

---

## 2. Couverture fonctionnelle MVP

| Domaine | Fonctionnalités | Source données | Statut |
|---------|-----------------|----------------|--------|
| Authentification | Login JWT, session, guards rôles | API + PostgreSQL | ✅ Livré |
| Chantiers | CRUD, liste, détail, workflow statut | API PostgreSQL | ✅ Livré |
| Historisation | Événements chantier | API PostgreSQL | ✅ Livré |
| Onglets fiche | Équipe, avancement, réserves, photos | API PostgreSQL | ✅ Livré |
| Formulaires écriture | Modales affectation, avancement, réserve, photo | API PostgreSQL | ✅ Livré |
| Dashboard conducteur | KPI, alertes, listes | API PostgreSQL | ✅ Livré (Phase H) |
| Dashboard direction | KPI, graphiques, à risque | API PostgreSQL | ✅ Livré (Phase H) |
| Réserves transverses | Page liste | Mock partiel FE | ⚠️ Partiel |
| Photos transverses | Page galerie | Mock partiel FE | ⚠️ Partiel |
| Vue mobile chef | Écran dédié | Mock / statique | ⚠️ Partiel |
| Upload photo binaire | Fichier réel | — | ❌ V2 |
| Rapports / Admin | Routes masquées | Placeholder | ❌ Hors MVP |
| Notifications push | — | — | ❌ V2 |
| Refresh token | — | — | ❌ V2 |

### 2.1 Règles métier couvertes (automatisées)

| ID | Règle | Tests |
|----|-------|-------|
| RG-001 | Retard si date fin dépassée et ≠ Clôture | FE + BE + E2E |
| RG-DATA-001 à 004 | Création, statut initial, workflow ±1, motif retour | BE + FE + E2E |
| RG-012 | Direction consultation seule | FE + E2E |
| RG-TABS-001 à 007 | Permissions onglets par rôle | FE + BE + E2E |
| Permissions MVP | Matrice rôles routes / actions | FE + E2E |

---

## 3. Résultats tests automatisés (20/06/2026)

Dernière exécution documentée — Phase H :

| Suite | Outil | Résultat |
|-------|-------|----------|
| Tests unitaires / composants frontend | Vitest + RTL | **74 / 74** ✅ |
| Tests unitaires backend | Jest | **28 / 28** ✅ |
| Tests API (Supertest) | Jest e2e | **26 / 26** ✅ |
| Tests E2E parcours | Playwright | **38 / 38** ✅ |
| Build frontend | `tsc` + Vite | ✅ |
| Build backend | `nest build` | ✅ |

**Commande reproduction :**

```bash
npm run test:all   # FE + BE + E2E (nécessite Playwright chromium)
```

### 3.1 Couverture par phase

| Phase | Périmètre | Tests clés |
|-------|-----------|------------|
| A–E | Layout, auth, navigation | E2E-AUTH, guards |
| F | Dashboard direction | T-F-RG, E2E-DASH-003–006 |
| G | Données réelles chantiers | T-G-RG/API, E2E-G |
| G-TABS | Onglets API | E2E-G-TABS |
| G-TABS-FORMS | Modales écriture | E2E-G-FORMS |
| Auth JWT | Login API | T-API-AUTH |
| H | Dashboards API, Swagger, seed 20 | T-H-API, T-H-SWAGGER |

---

## 4. Cahier de recette métier — statut

Document : `docs/07-Cahier-Recette-Metier.md`

| ID | Intitulé | Auto. partiel | Recette manuelle |
|----|----------|---------------|------------------|
| REC-001 | Création chantier | E2E-G-001 | ☐ À exécuter |
| REC-002 | Modification chantier | — | ☐ À exécuter |
| REC-003 | Changement statut | E2E-G-002 | ☐ À exécuter |
| REC-004 | Retour arrière motif | Tests composant | ☐ À exécuter |
| REC-005 | Affectation utilisateur | E2E-G-FORMS-001 | ☐ À exécuter |
| REC-006 | Ajout avancement | E2E-G-FORMS-002 | ☐ À exécuter |
| REC-007 | Création réserve | E2E-G-FORMS-003 | ☐ À exécuter |
| REC-008 | Levée réserve | E2E-G-TABS-003 | ☐ À exécuter |
| REC-009 | Ajout photo | E2E-G-FORMS-004 | ☐ À exécuter |
| REC-010 | Consultation historique | — | ☐ À exécuter |
| REC-011 | Dashboard conducteur | E2E-DASH-001–002 | ☐ À exécuter |
| REC-012 | Dashboard direction | E2E-DASH-004–006 | ☐ À exécuter |
| REC-013 | Refus clôture réserve ouverte | — | ☐ À exécuter* |
| REC-014 | Contrôle rôles | E2E-ROLE, E2E-AUTH | ☐ À exécuter |
| REC-015 | Connexion JWT | E2E-AUTH + API | ☐ À exécuter |

\* REC-013 : règle documentée ; enforcement strict non implémenté en MVP.

**Environnement recette :** seed 20 chantiers (`npm run prisma:seed`), comptes § API.md.

---

## 5. Écarts connus (synthèse)

| # | Écart | Impact recette | Plan |
|---|-------|----------------|------|
| E1 | Pas d’upload photo binaire | REC-009 partiel (URL) | V2 |
| E2 | Pas de refresh token | Reconnexion après 15 min | V2 |
| E3 | CI/CD non commité | Process manuel | Phase I doc + déploiement |
| E4 | Frontend Docker en mode dev | Prod à hardener | Dockerfile Nginx |
| E5 | Pages Réserves/Photos transverses mockées | Consultation limitée | V2 API |
| E6 | Vue mobile chef partielle | REC terrain limité | V2 mobile |
| E7 | Pas de cron alertes | Alertes calculées à la lecture | V2 |
| E8 | Clôture avec réserves ouvertes non bloquée | REC-013 partiel | V2 workflow |

---

## 6. Recommandation de passage REC

| Critère | Statut |
|---------|--------|
| Tests automatisés verts | ✅ |
| Documentation utilisateur / exploitation / DAT | ✅ |
| Jeu de données recette (20 chantiers) | ✅ |
| Campagne manuelle REC-001 à REC-015 | ☐ **À planifier** (1–2 j métier) |
| Correction écarts bloquants | Aucun identifié pour REC |

**Verdict :** le MVP est **éligible à une recette métier** sur environnement seedé. La bascule **PROD** requiert les actions du DAT §12 (TLS, secrets, sauvegardes automatisées, CI/CD).

---

## 7. Signatures (à compléter)

| Rôle | Nom | Date | Visa |
|------|-----|------|------|
| MOA BatiNova | | | |
| MOE / Dev | | | |
| Recette métier | | | |

---

*Dossier de recette — Phase I — BatiNova*
