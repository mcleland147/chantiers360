# EVOL-002 — Planning des ouvriers

**Processus :** `docs/23-Processus-Gestion-Evolutions.md`  
**Release :** 1.1.0 · **Lot :** 1.1-B  
**Références techniques :** `docs/24-Release-1.1-Backlog.md` §B · `docs/22-Release-1.1-DataModel.md`

---

## En-tête

| Champ | Valeur |
|-------|--------|
| **ID** | EVOL-002 |
| **Titre** | Planning des ouvriers |
| **Type** | F — Fonctionnelle |
| **Priorité** | P1 |
| **Statut** | **Recette OK** — Gate B validé |
| **Demandeur** | Direction BTP / Conducteur de travaux |
| **Date demande** | 15/06/2026 |
| **Version cible** | v1.1.0 |
| **Auteur fiche** | Équipe BatiNova |
| **Lot développement** | 1.1-B |

---

## 1. Demande client

### 1.1 Contexte

Les affectations MVP (`Assignment`) lient un utilisateur applicatif à un chantier sans **dimension temporelle**. Il n'existe pas de vue planning pour organiser les ouvriers terrain sur la semaine ou le mois. Les conducteurs gèrent les équipes via tableurs externes.

### 1.2 Besoin exprimé

> « Avoir un planning hebdomadaire et mensuel des ouvriers, pouvoir les affecter à un chantier sur un créneau horaire, être alerté en cas de double affectation, filtrer par chantier ou par ouvrier, et voir un indicateur d'occupation des équipes. »

### 1.3 Bénéfice attendu

- Vision centralisée des ressources terrain
- Réduction des conflits de planning et des oublis
- KPI occupation pour pilotage direction
- Remplacement partiel des tableurs Excel

### 1.4 Échéance souhaitée

Release **1.1.0** — lot B (après validation lot A).

---

## 2. Qualification

### 2.1 Périmètre IN

- Référentiel **ouvriers** (`Worker`) — nom, prénom, métier, actif/inactif — **distinct de User** (ADR-001)
- Champs modèle `hourlyRate`, `dailyRate` (optionnels, non UI v1.1 — préparation coût MO V1.2+)
- Créneaux **WorkerSchedule** : ouvrier, chantier, début, fin, statut, notes
- Vue **semaine** (défaut) et vue **mois**
- **Affectation** créneau via modale
- **Détection conflits** (chevauchement même ouvrier) → HTTP 409
- **Filtres** chantier et ouvrier — liste chantiers = **périmètre autorisé** (RG-PLA-04)
- **KPI occupation** (% heures planifiées / référentiel 35 h/semaine)
- Page `/planning` + entrée menu
- Historisation création/modification créneau sur chantier
- Rôles : écriture Conducteur ; lecture Direction, Assistante, Chef (périmètre)

### 2.2 Périmètre OUT

- Synchronisation Google Calendar / Outlook
- Gestion paie, heures sup, badges
- Saisie tarifs horaire/journalier en UI (champs modèle prévus, exploitation V1.2+)
- Notifications push à l'ouvrier
- Géolocalisation terrain
- Optimisation automatique des affectations (IA)

### 2.3 Utilisateurs impactés

| Rôle | Impact |
|------|--------|
| Direction | Lecture planning global + KPI occupation |
| Assistante administrative | Lecture |
| Conducteur de travaux | CRUD ouvriers + créneaux |
| Chef de chantier | Lecture chantiers affectés |

### 2.4 Critères d'acceptation

1. **Étant donné** un conducteur, **quand** il ouvre `/planning`, **alors** la semaine courante s'affiche avec les créneaux existants.
2. **Étant donné** un ouvrier déjà planifié 8h–12h lundi, **quand** on tente 10h–14h même jour, **alors** erreur conflit avec détail du créneau existant.
3. **Étant donné** un filtre chantier CHT-001, **alors** seuls les créneaux de ce chantier apparaissent.
4. **Étant donné** la vue mois, **quand** on bascule depuis semaine, **alors** les totaux par jour sont cohérents.
5. **Étant donné** un créneau annulé (`CANCELLED`), **alors** il n'entre pas en conflit avec un nouveau créneau.
6. **Étant donné** un conducteur connecté, **quand** il ouvre le filtre ou la modale d'affectation, **alors** seuls **ses** chantiers référents sont proposés (RG-PLA-04) ; tentative sur un autre chantier → **403** côté API.

### 2.5 Dépendances

| Dépendance | Statut |
|------------|--------|
| Lot 1.1-A validé (gate) | Bloquante séquence |
| Chantiers MVP | ✅ |
| Users / rôles JWT | ✅ |
| EVOL-003 | Info — indépendant |

---

## 3. Analyse d'impact

| Domaine | Impact | Détail |
|---------|--------|--------|
| Règles métier | Majeur | RG-PLA-01 conflits, RG-PLA-02 endAt > startAt, RG-PLA-04 périmètre chantiers |
| Rôles / permissions | Modéré | Nouveau module + route `/planning` |
| API REST | Majeur | ~9 endpoints Planning + Workers |
| Base de données | Migration | `0004_worker_planning` |
| Frontend | Majeur | Nouvelle page + composants calendrier |
| Performance | Modéré | Requêtes plage dates indexées |
| Sécurité | Faible | Données planning non sensibles |
| Exploitation | Faible | PostgreSQL uniquement |

### 3.1 Documents à mettre à jour

- [x] Conception — impact analysis, data model
- [ ] `docs/06-Cahier-de-tests.md` — TST-R11-B-*
- [ ] `docs/07-Cahier-Recette-Metier.md` — REC-EVOL-002-*
- [ ] `docs/25-Changelog.md`
- [ ] `docs/API.md`
- [ ] `docs/09-Guide-Utilisateur.md` § Planning
- [ ] `docs/08-DAT-v1.md`
- [ ] `docs/SPEC-UI-MVP.md` — extension ou SPEC-UI-R1.1

### 3.2 Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Complexité UI calendrier | Moyenne | Moyen | FullCalendar ou grille simplifiée — AD-02 |
| Fuseaux horaires | Moyenne | Moyen | Stockage UTC, affichage Europe/Paris |
| Confusion Worker vs User | Moyenne | Moyen | **ADR-001** + libellés UI « Ouvriers » + `Worker.userId` optionnel |
| Performance mois chargé | Faible | Moyen | Index + limite plage query |

---

## 4. Chiffrage

| Poste | j/h bas | j/h médian | j/h haut |
|-------|---------|------------|----------|
| Développement | 9 | 11 | 14 |
| Tests | 2 | 2,5 | 3,5 |
| Recette & documentation | 1 | 1,5 | 2 |
| Déploiement | 0,5 | 0,5 | 1 |
| Marge risque (+20 %) | 2,5 | 3 | 4 |
| **Total** | **15** | **14** | **18** |

**Hypothèses :** ouvriers sans compte login ; pas de sync externe.  
**Exclusions :** module paie, notifications.

---

## 5. Validation

| Validateur | Rôle | Date | Accord |
|------------|------|------|--------|
| Comité évolutions | Arbitrage | 21/06/2026 | ✅ Validée — v1.1.0 |
| MOA client | Métier | _À compléter avant dev_ | ☐ |

---

## 6. Développement

| Élément | Valeur |
|---------|--------|
| Branche Git | `evol/EVOL-002-planning-ouvriers` |
| Pull Request | _À créer_ |
| Migration Prisma | ✅ `0004_worker_planning` |
| ADR | [`docs/architecture/ADR-001-User-vs-Worker.md`](../docs/architecture/ADR-001-User-vs-Worker.md) |

---

## 7. Tests

### 7.1 Tests automatisés prévus

| ID | Type | Fichier | Description |
|----|------|---------|-------------|
| TST-EVOL-002-01 | Unit | `planning-conflicts.spec.ts` | Chevauchement détecté |
| TST-EVOL-002-02 | Unit | idem | CANCELLED ignoré |
| TST-EVOL-002-03 | API | `planning.api.spec.ts` | CRUD slot |
| TST-EVOL-002-04 | API | idem | 409 conflit |
| TST-EVOL-002-05 | API | `workers.api.spec.ts` | CRUD ouvrier |
| TST-EVOL-002-06 | API | `planning-kpi.api.spec.ts` | KPI occupation |
| TST-EVOL-002-07 | RTL | `PlanningFilters.test.tsx` | Filtres |
| TST-EVOL-002-08 | E2E | `planning-affectation.spec.ts` | Parcours affectation |
| TST-EVOL-002-09 | Unit FE + BE | `planningChantiers.test.ts`, `planning.service.spec.ts` | RG-PLA-04 — périmètre chantiers par rôle |

### 7.2 Exécution

Tous les tests TST-EVOL-002-01 à 09 passent (CI locale — voir rapport lot B).

---

## 8. Recette métier

### 8.1 Scénarios

| ID | Objectif | Statut | Exécutant | Date |
|----|----------|--------|-----------|------|
| REC-EVOL-002-01 | Créer créneau ouvrier sur chantier | ✅ | Conducteur | 21/06/2026 |
| REC-EVOL-002-02 | Conflit affiché et bloquant | ✅ | Conducteur | 21/06/2026 |
| REC-EVOL-002-03 | Filtres chantier + ouvrier | ✅ | Conducteur | 21/06/2026 |
| REC-EVOL-002-04 | Vue mois + navigation | ✅ | Direction | 21/06/2026 |
| REC-EVOL-002-05 | KPI occupation cohérent | ✅ | Direction | 21/06/2026 |
| REC-EVOL-002-06 | Désactiver ouvrier — plus en liste affectation | ✅ | Conducteur | 21/06/2026 |
| REC-EVOL-002-07 | Périmètre chantiers planning (RG-PLA-04) | ✅ | Conducteur | 21/06/2026 |

### 8.2 Signature recette

| Validateur métier | Date | Signature |
|-------------------|------|-----------|
| _Nom_ | _—_ | ☐ Recette acceptée |

---

## 9. Déploiement & rollback

### 9.1 Déploiement

| Environnement | Date | Version | Résultat |
|---------------|------|---------|----------|
| REC | _—_ | v1.1.0-rc.B | ☐ |
| PROD | _—_ | v1.1.0 | ☐ |

### 9.2 Procédure de rollback

**Migration 0004 uniquement :**

```bash
npm run ops:backup
git checkout v1.1.0-rc.A   # ou commit pré-lot B
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
npm run ops:health
```

**Rollback SQL manuel si nécessaire :**

```sql
DROP TABLE IF EXISTS "WorkerSchedule";
DROP TABLE IF EXISTS "Worker";
DROP TYPE IF EXISTS "ScheduleStatus";
```

Pas d'impact sur photos (lot A). **Durée estimée :** 10–15 min.

---

## 10. Clôture — Definition of Done

```
[ ] D1–D8 — voir processus RUN §7
```

**Statut final :** Recette OK — Gate B validé — GO EVOL-003 autorisé sous validation MOA

---

*EVOL-002 — Planning des ouvriers — Chantiers360 / BatiNova*
