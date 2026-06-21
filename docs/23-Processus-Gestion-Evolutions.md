# Processus de gestion des évolutions — Chantiers360 (phase RUN)

**Version :** 1.0  
**Date :** 21/06/2026  
**Statut :** Cadre méthodologique — phase RUN (post go-live ou REC stabilisée)  
**Public :** MOA client, chef de projet, développement, exploitation  
**Références :** `docs/24-Template-Fiche-Evolution.md`, `docs/25-Changelog.md`, `evolutions/`

---

## 1. Objet

Ce document définit le **processus unique** pour toute évolution applicative Chantiers360 en phase RUN :

- nouvelle fonctionnalité ;
- évolution d’une règle métier ;
- correction impactante (hors hotfix d’urgence) ;
- évolution technique visible (API, permissions, exports, etc.).

**Hors périmètre :** incidents P1 sans changement de code (runbook `docs/21-Runbook-Incident.md`) · correctifs infra purs · montées de version Dependabot mineures sans impact métier.

---

## 2. Principes

| Principe | Application |
|----------|-------------|
| **Une évolution = une fiche** | Identifiant `EVOL-NNN` dans `evolutions/` |
| **Pas de dev sans validation** | Statut `Validée` obligatoire avant branche feature |
| **Traçabilité** | Changelog + tag semver + PR liée à la fiche |
| **Tests avant prod** | CI verte + recette métier ciblée |
| **Rollback prévu** | Documenté avant déploiement PROD |
| **Documentation à jour** | Guides, cahiers tests/recette, API si contrat modifié |

---

## 3. Rôles et responsabilités

| Rôle | Responsabilités |
|------|-----------------|
| **Demandeur / MOA client** | Formuler le besoin, prioriser, valider recette métier |
| **Chef de projet / Product** | Qualification, planning, arbitrage périmètre |
| **Développeur** | Analyse d’impact, chiffrage technique, implémentation, tests |
| **QA / testeur** | Exécution cahier de tests + scénarios recette |
| **Exploitant / ops** | Backup pré-deploy, déploiement, monitoring post-deploy |
| **Validateur métier** | Signature recette (souvent MOA ou conducteur référent) |

*En petite équipe, un même intervenant peut cumuler plusieurs rôles — les étapes restent obligatoires.*

---

## 4. Typologie des évolutions

| Type | Code | Exemple | Circuit |
|------|------|---------|---------|
| **Évolution fonctionnelle** | `F` | Export Excel des réserves | Processus complet |
| **Évolution technique** | `T` | Optimisation requête, refacto API | Processus complet (recette allégée si pas d’impact UI) |
| **Correction** | `C` | Bug bloquant workflow | Processus complet ou accéléré (§11) |
| **Évolution réglementaire** | `R` | Nouvelle obligation traçabilité | Processus complet — priorité haute |

---

## 5. Cycle de vie — vue d’ensemble

```
Demande → Qualification → Analyse impact → Chiffrage → Validation
    → Développement → Tests → Recette → Déploiement → Clôture
                              ↓ (échec)
                           Rollback
```

| # | Étape | Livrable | Responsable | Gate (bloquant) |
|---|-------|----------|-------------|-----------------|
| 1 | **Demande client** | Fiche `EVOL-NNN` créée (statut `Brouillon`) | Demandeur | — |
| 2 | **Qualification** | Périmètre IN/OUT, type, priorité | Chef de projet | Fiche complète §1–3 |
| 3 | **Analyse d’impact** | §4 fiche : métier, rôles, API, BDD, perf, sécu | Développeur | Impacts documentés |
| 4 | **Chiffrage** | §5 fiche : j/h, risques, dépendances | Développeur + CP | Estimation validée |
| 5 | **Validation** | Accord client / MOA (écrit) | MOA | Statut → `Validée` |
| 6 | **Développement** | Branche `evol/EVOL-NNN-*`, PR | Développeur | — |
| 7 | **Tests** | Tests auto + cahier de tests | Développeur + QA | CI verte |
| 8 | **Recette** | Scénarios REC exécutés | MOA / testeur | Recette signée |
| 9 | **Déploiement** | PROD (ou REC puis PROD) | Ops | Backup préalable |
| 10 | **Rollback** | Si échec post-deploy | Ops + dev | Procédure §9 fiche |
| 11 | **Clôture** | Changelog, tag, doc, fiche `Livrée` | Chef de projet | DoD §7 |

---

## 6. Détail des étapes

### 6.1 Demande client

1. Créer `evolutions/EVOL-NNN-<slug>.md` à partir de `docs/24-Template-Fiche-Evolution.md`.
2. Renseigner : contexte, besoin exprimé, bénéfice attendu, échéance souhaitée.
3. Attribuer un **identifiant séquentiel** (`EVOL-001`, `EVOL-002`, …).
4. Statut : `Brouillon`.

**Canal :** email, ticket, réunion de comité — la fiche Git est la **source de vérité**.

---

### 6.2 Qualification

Le chef de projet complète :

- **Périmètre IN / OUT** (ce qui est inclus / exclu de la livraison) ;
- **Type** (F / T / C / R) et **priorité** (P1 urgente → P4 basse) ;
- **Utilisateurs impactés** (Conducteur, Direction, Chef, …) ;
- **Dépendances** (autre EVOL, infra, données externes).

**Critères de refus ou report :**

- besoin flou sans critère d’acceptation ;
- doublon avec évolution déjà planifiée ;
- hors périmètre contrat / budget sans avenant.

Statut : `En qualification` → `Qualifiée` ou `Refusée` (motif documenté).

---

### 6.3 Analyse d’impact

Le développeur renseigne la §4 de la fiche :

| Domaine | Questions |
|---------|-----------|
| **Métier** | Règles modifiées ? Workflow chantier / réserves ? |
| **Rôles & permissions** | Nouveaux droits ? Guards backend / masquage UI ? |
| **API** | Nouveaux endpoints ? Breaking change ? → mettre à jour `docs/API.md` |
| **Base de données** | Migration Prisma ? Données existantes ? |
| **Frontend** | Pages / composants / routes touchés ? |
| **Performance** | Volume données (exports, listes) ? |
| **Sécurité** | Données sensibles, CORS, JWT, audit ? |
| **Exploitation** | Backup, cron, monitoring, logs ? |
| **Tests existants** | Régressions potentielles (lister fichiers) |

**Livrable :** matrice d’impact complétée + liste des documents à mettre à jour.

---

### 6.4 Chiffrage

Référence unité : **jours.homme (j/h)** — méthode alignée sur `docs/13-Chiffrage.md`.

| Poste | Contenu |
|-------|---------|
| Développement | Backend, frontend, migrations |
| Tests | Unitaires, API, E2E ciblés |
| Recette & doc | Mise à jour cahiers, guides |
| Déploiement | REC + PROD, accompagnement |
| **Marge risque** | +15 à 25 % si impacts BDD ou API publics |

Renseigner §5 fiche : estimation basse / médiane / haute, hypothèses, exclusions.

**Gate :** accord client sur budget ou enveloppe RUN (contrat de maintenance).

---

### 6.5 Validation

Avant tout développement :

- [ ] Périmètre et critères d’acceptation signés (email ou case fiche) ;
- [ ] Chiffrage accepté ou inclus dans forfait RUN ;
- [ ] Date cible REC / PROD convenue ;
- [ ] Statut fiche → **`Validée`** ;
- [ ] Entrée ajoutée dans `docs/25-Changelog.md` section `[Unreleased]` :

```markdown
### Added (planned)
- EVOL-NNN — Titre court ([#PR](lien)) — _Validée, en attente dev_
```

---

### 6.6 Développement

| Règle | Détail |
|-------|--------|
| Branche | `evol/EVOL-NNN-<slug>` depuis `main` |
| Commits | Préfixe `evol(EVOL-NNN):` ou `feat(EVOL-NNN):` |
| PR | Titre `EVOL-NNN — <titre>` · lien vers fiche `evolutions/` |
| CI | Doit passer (`.github/workflows/ci.yml`) |
| Migrations | `prisma migrate` nommée, réversible si possible |

Statut fiche : `En développement`.

**Interdit :** merger sur `main` sans revue de code et CI verte.

---

### 6.7 Tests

Aligné sur `docs/06-Cahier-de-tests.md` :

1. **Tests automatisés** ajoutés ou mis à jour (minimum : règle métier, composant ou API, rôle, E2E si parcours touché).
2. **Cahier de tests** : nouvelles entrées `TST-EVOL-NNN-*` ou mise à jour IDs existants.
3. **Commandes locales :**

```bash
npm run ci:test
npm run ci:build
# si impact Docker : npm run ci:docker
```

4. Renseigner §7 de la fiche : liste des tests exécutés + résultat.

5. **Recette MOA assistée** — pour chaque évolution, le développeur produit :

| Livrable | Emplacement |
|----------|-------------|
| Tests automatisés (contrôles factuels) | `e2e/tests/recette/evol-NNN-*.spec.ts` |
| Scénarios MOA manuels (jugement humain) | `docs/33-Cahier-Recette-MOA-Manuelle.md` ou fiche dérivée du template `docs/34-Template-Recette-MOA-Manuelle-Evolution.md` |
| Mise à jour matrice d'automatisation | `docs/31-Matrice-Automatisation-Recette.md` |
| Rapport recette automatique | `docs/rapports/recette-auto/recette-auto-YYYY-MM-DD.md` via `npm run test:recette` |
| Mise à jour cahier recette métier | `docs/07-Cahier-Recette-Metier.md` (colonnes Automatisé / Test / MOA) |

Référence framework : `docs/32-Framework-Recette-Automatisee.md`.

**Règle :** ne pas automatiser les jugements métier subjectifs ; la signature MOA reste obligatoire. `test:recette` n'est pas un job CI bloquant tant que décidé par l'équipe.

Statut fiche : `En test`.

---

### 6.8 Recette

1. Exécuter la **recette automatisée** : `npm run test:recette` (stack réelle PostgreSQL + API + JWT).
2. Archiver le rapport généré dans `docs/rapports/recette-auto/`.
3. Déployer sur **environnement REC** si validation complémentaire requise (pas de seed demo en PROD).
4. Ajouter ou mettre à jour scénarios dans `docs/07-Cahier-Recette-Metier.md` :

   - format `REC-EVOL-NNN-01`, `REC-EVOL-NNN-02`, …
   - colonnes **Automatisé**, **Test associé**, **À valider MOA**

5. Exécuter les scénarios **MOA manuels** (`docs/33-Cahier-Recette-MOA-Manuelle.md` ou template §34).
6. Exécution par le **validateur métier** avec comptes REC réels pour les scénarios non automatisables.
7. Anomalies : ticket / commentaire PR — pas de deploy PROD tant que bloquants ouverts.
8. Signature recette dans §8 fiche (nom, date) — **décision GO / NO GO** (MOA-GLOBAL-02).

Statut fiche : `Recette OK` → prêt pour PROD.

---

### 6.9 Déploiement

**Checklist pré-deploy PROD :**

- [ ] Backup BDD : `npm run ops:backup` (sur serveur PROD)
- [ ] Fenêtre de maintenance communiquée (si downtime)
- [ ] `.env.prod` vérifié (pas de changement non testé en REC)
- [ ] Procédure rollback §9 fiche validée

**Déploiement standard :**

```bash
# Sur VPS — voir docs/10-Guide-Exploitation.md §7
cd /opt/chantiers360
git fetch && git checkout <tag-ou-commit>
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
npm run ops:health
```

**Post-deploy (15 min) :**

- [ ] `ops:health` OK
- [ ] Smoke : login + parcours critique EVOL
- [ ] Logs backend sans erreur récurrente
- [ ] Monitoring externe repasse au vert

Statut fiche : `Déployée`.

---

### 6.10 Rollback

En cas d’échec post-deploy (P1/P2) :

1. **Décision** : chef de projet + ops (cf. `docs/21-Runbook-Incident.md`).
2. **Application** : procédure §9 de la fiche EVOL (image/commit précédent + restore BDD si migration).
3. **Communication** : utilisateurs impactés, incident documenté.
4. Statut fiche : `Rollback` puis retour `En développement` ou `Annulée`.

**Rollback standard (sans migration BDD destructive) :**

```bash
git checkout v<version-précédente>
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
npm run ops:health
```

**Avec migration Prisma incompatible :**

```bash
npm run ops:restore -- backup/chantiers360_<pré-deploy>.sql.gz
```

---

### 6.11 Mise à jour documentation

À la clôture, mettre à jour **au minimum** les documents impactés (cocher dans §6 fiche) :

| Document | Quand |
|----------|-------|
| `docs/25-Changelog.md` | Toujours — version et date réelles |
| `docs/06-Cahier-de-tests.md` | Tests automatisés / manuels ajoutés |
| `docs/07-Cahier-Recette-Metier.md` | Nouveaux scénarios métier |
| `docs/API.md` | Contrat API modifié |
| `docs/09-Guide-Utilisateur.md` | Changement visible utilisateur |
| `docs/10-Guide-Exploitation.md` | Impact ops (cron, backup, env) |
| `docs/08-DAT-v1.md` | Changement architecture significatif |
| `docs/21-Runbook-Incident.md` | Nouveau risque ou procédure incident |

**Versioning :**

```bash
git tag -a v1.1.0 -m "EVOL-001 Export Excel réserves"
git push origin v1.1.0
```

Convention semver RUN :

| Type évolution | Incrément |
|----------------|-----------|
| Évolution fonctionnelle visible | **MINOR** (1.0.0 → 1.1.0) |
| Correction seule | **PATCH** (1.0.0 → 1.0.1) |
| Breaking API / migration majeure | **MAJOR** (1.x → 2.0.0) — rare, validation MOA renforcée |

Statut fiche : **`Livrée`**.

---

## 7. Definition of Done — évolutions RUN

Une évolution est **terminée** lorsque **tous** les critères suivants sont remplis :

| # | Critère | Preuve |
|---|---------|--------|
| D1 | **Fiche évolution validée** | Statut `Livrée` · §5 validation signée |
| D2 | **Impacts analysés** | §4 fiche complète · revue dev |
| D3 | **Tests ajoutés** | PR · CI verte · couverture ciblée documentée §7 |
| D4 | **Cahier de tests mis à jour** | Entrées `TST-EVOL-NNN-*` dans `docs/06-Cahier-de-tests.md` |
| D5 | **Cahier de recette mis à jour** | Scénarios `REC-EVOL-NNN-*` exécutés et signés §8 |
| D6 | **Changelog mis à jour** | Entrée versionnée dans `docs/25-Changelog.md` |
| D7 | **Version taguée** | Tag git `vX.Y.Z` sur `main` |
| D8 | **Procédure de rollback documentée** | §9 fiche · testée si migration BDD |

**Checklist DoD (à copier en fin de fiche) :**

```
[ ] D1 Fiche validée et statut Livrée
[ ] D2 Impacts analysés (§4)
[ ] D3 Tests ajoutés + CI verte
[ ] D4 Cahier de tests à jour
[ ] D5 Cahier de recette à jour + signé
[ ] D6 Changelog à jour
[ ] D7 Tag vX.Y.Z poussé
[ ] D8 Rollback documenté (§9)
```

---

## 8. Registre des évolutions

| ID | Titre | Type | Priorité | Statut | Version | Fichier |
|----|-------|------|----------|--------|---------|---------|
| EVOL-001 | Upload réel photos | F | P1 | **Conception GO** | v1.1.0 | `evolutions/EVOL-001-upload-photos.md` |
| EVOL-002 | Planning ouvriers | F | P1 | **Conception GO** | v1.1.0 | `evolutions/EVOL-002-planning-ouvriers.md` |
| EVOL-003 | Budget & ressources | F | P1 | **Conception GO** | v1.1.0 | `evolutions/EVOL-003-budget-ressources.md` |

*Maintenir ce tableau à jour à chaque nouvelle fiche.*

---

## 9. Processus accéléré (hotfix)

Pour **correction P1 production** (incident actif, contournement impossible) :

1. Fiche EVOL créée **a posteriori** ou simplifiée (sections 1–4 minimales).
2. Branche `hotfix/EVOL-NNN` depuis tag PROD actuel.
3. Tests ciblés + CI · deploy PROD · changelog PATCH.
4. Recette métier **a posteriori** sous 48 h si contournement temporaire.

Ne pas utiliser le circuit hotfix pour des évolutions fonctionnelles planifiées.

---

## 10. Références

| Document | Chemin |
|----------|--------|
| Template fiche évolution | `docs/24-Template-Fiche-Evolution.md` |
| Changelog | `docs/25-Changelog.md` |
| Product Backlog | `docs/26-Product-Backlog.md` |
| Comité évolutions | `docs/27-Comite-Evolutions.md` |
| Release Management | `docs/28-Release-Management.md` |
| Readiness R1.1 RUN | `docs/29-Release-1.1-Readiness-Review.md` |
| Dossier évolutions | `evolutions/` |
| Cahier de tests | `docs/06-Cahier-de-tests.md` |
| Cahier recette métier | `docs/07-Cahier-Recette-Metier.md` |
| Guide exploitation | `docs/10-Guide-Exploitation.md` |
| Runbook incident | `docs/21-Runbook-Incident.md` |
| Point d’arrêt go-live | `docs/22-Point-Arret-Go-Live.md` |
| Chiffrage | `docs/13-Chiffrage.md` |

---

*Processus gestion évolutions — Phase RUN — Chantiers360 / BatiNova*
