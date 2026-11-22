# Références externes — Enseignements de Chantiers360

**Projet destinataire :** CampusFlow  
**Statut :** projet de document à compléter — aucune adoption automatique des pratiques décrites.

## 1. Contexte et objectif

CampusFlow doit notamment répondre à des difficultés de réservation illustrées par l’incident de la salle Atlas : deux collaborateurs ont suivi des démarches différentes pour utiliser la même salle sur un même créneau, sans obtenir une réservation reconnue de façon univoque. Ce point provient du contexte CampusFlow, et non des sources Chantiers360.

Les consultations du dépôt externe `mcleland147/chantiers360` ont porté sur la vérification de l’accès à une source GitHub rattachée au projet, puis sur l’examen de sa « Definition of Done ».

L’objectif de cette capitalisation est d’identifier des pratiques susceptibles d’aider CampusFlow à :
- définir des critères vérifiables de qualité ;
- relier exigences, tests et résultats ;
- rendre les validations explicites ;
- distinguer une référence externe d’une règle effectivement adoptée pour CampusFlow.

**Ces références sont des sources d’inspiration, pas des décisions applicables à CampusFlow.**

## 2. Sources consultées et provenance disponible

### Source 1 — Première consultation : provenance partiellement identifiée

| Élément | Provenance disponible et limites |
|---|---|
| Dépôt mentionné | `mcleland147/chantiers360`, selon la trace rapportée dans la révision 1 du présent document ; cette mention ne permet pas d’identifier le fichier consulté |
| Chemin du fichier | Non établi avec les éléments accessibles |
| Branche ou référence demandée | Non établie |
| Blob SHA — identité du contenu | Non disponible |
| Commit SHA — version du dépôt | Non disponible |
| Date de lecture | Non établie |
| Trace de consultation | La révision 1 rapporte qu’un extrait de réponse antérieure annonçait une lecture intégrale avec couverture `COMPLETE` ; le résultat Git original correspondant n’est pas disponible parmi les éléments consultés pour cette révision |
| Portée probante | Cette trace documentaire indirecte ne permet pas de vérifier le contenu lu, son chemin ni sa version exacte |

**Limite d’attribution.** La provenance de cette première consultation reste incomplète. La mention d’une couverture `COMPLETE`, rapportée dans le document antérieur, ne constitue pas à elle seule une preuve vérifiable de l’identité du fichier ou de sa version. Aucun autre fichier du dépôt ne lui est substitué par déduction ; aucune conclusion précise ne lui est attribuée.

### Source 2 — Definition of Done de Chantiers360 : provenance Git vérifiée

| Élément | Provenance retournée par l’outil de lecture Git |
|---|---|
| Dépôt | `mcleland147/chantiers360`, confirmé comme rattaché au projet CampusFlow |
| Chemin du fichier | `.cursor/rules/chantiers360-definition-of-done.mdc` |
| Référence demandée | `main` |
| **Blob SHA — identité du contenu du fichier** | `cf900043cb9776287302445af1b111c42995d220` |
| **Commit SHA — version du dépôt contenant ce fichier** | `8c398c494dd918272aab5b2653777c6c21d2e76e` |
| Vérification du commit | `commitShaVerified: true`, selon le résultat de l’outil |
| Date de lecture | `2026-11-09T20:03:34.847Z` |
| Couverture | `COMPLETE` |
| Accès utilisé | Lecture seule |

**Référence figée au commit vérifié :** [Definition of Done de Chantiers360](https://github.com/mcleland147/chantiers360/blob/8c398c494dd918272aab5b2653777c6c21d2e76e/.cursor/rules/chantiers360-definition-of-done.mdc).

**Correction de provenance.** La révision 1 présentait `cf900043cb9776287302445af1b111c42995d220` comme un « commit résolu » et l’utilisait dans le lien figé. Le résultat Git consulté identifie explicitement cette valeur comme le **blob SHA**, et non comme le commit SHA. Le champ `resolvedSha` retourné porte également cette valeur ; il ne doit donc pas être interprété comme une preuve de commit. Le commit vérifié est `8c398c494dd918272aab5b2653777c6c21d2e76e`, utilisé dans le lien corrigé ci-dessus.

Cette provenance établit le contenu et la version accessibles lors de la présente vérification. Elle ne démontre pas que ce commit était celui de la consultation antérieure et ne complète pas, par assimilation, la provenance de la Source 1. La lecture du fichier ne prouve ni l’exécution des tests ni l’application effective des pratiques décrites.
## 3. Enseignements utiles

Les faits ci-dessous proviennent de la **source 2**. Les analyses et propositions sont distinctes.

### 3.1. Qualité : définir ce que signifie « terminé »

**Faits issus de la source.** Le fichier énonce cinq conditions : créer ou adapter les tests automatisés, mettre à jour le cahier de tests, exécuter les tests et corriger les échecs, réaliser le build concerné et fournir une synthèse des tests et de leurs résultats.

**Analyse.** Cette approche distingue la réalisation d’une fonctionnalité de la démonstration de son bon fonctionnement.

**Recommandation conditionnelle.** Si CampusFlow souhaite formaliser ses critères de livraison, examiner une définition de « terminé » adaptée à ses risques et à ses moyens de vérification.

### 3.2. Traçabilité : relier les tests à des références explicites

**Faits issus de la source.** Le cahier de tests doit contenir un identifiant, un type, des étapes, un résultat attendu, un statut et un lien vers le fichier de test. La synthèse de phase doit citer les quatre identifiants de tests correspondant aux catégories demandées.

**Analyse.** Ces liens rendent les vérifications plus faciles à retrouver et à examiner. Leur prescription dans un fichier ne prouve cependant pas qu’ils sont effectivement renseignés.

**Recommandation conditionnelle.** Si ce mode de suivi est retenu, relier pour CampusFlow chaque règle importante à un scénario, un résultat attendu et une preuve d’exécution. Un scénario de demandes concurrentes sur Atlas pourrait être étudié, une fois la règle de priorité clarifiée.

### 3.3. Validation : varier les angles de vérification

**Faits issus de la source.** Chaque phase doit comporter au moins quatre tests significatifs : règle métier, composant, rôle ou accès, parcours utilisateur de bout en bout. Une catégorie sans pertinence doit être justifiée dans le cahier.

**Analyse.** L’intérêt réside dans la diversité des risques couverts, plutôt que dans le seul nombre de tests.

**Recommandation conditionnelle.** Selon le périmètre retenu pour CampusFlow, examiner des vérifications sur :
- les conflits de réservation ;
- les interactions de l’interface ;
- les droits de consultation et de modification ;
- un parcours complet de réservation.

Ces exemples sont des pistes à examiner, pas des règles métier arrêtées.

### 3.4. Gouvernance des changements : examiner les impacts avant une phase

**Faits issus de la source.** Le fichier demande de vérifier les impacts sur les règles métier, les rôles, la navigation, les tests existants et le cahier de tests avant chaque nouvelle phase.

**Analyse.** Cette revue peut aider à repérer les effets indirects d’une évolution. Elle ne constitue pas, à elle seule, un processus complet d’arbitrage métier.

**Recommandation conditionnelle.** Si CampusFlow adopte une revue d’impact, y inclure les règles de réservation, les permissions et les parcours existants, avec une validation humaine des changements métier.

## 4. Limites de transposition

- **Domaine propre à Chantiers360.** Les notions de Chantier, Réserve, Réalisation et les références `RG-001` à `RG-013` ne sont pas des exigences CampusFlow.
- **Rôles spécifiques.** Direction, Assistante, Conducteur et Chef ne doivent pas être assimilés automatiquement aux acteurs de CampusFlow.
- **Choix techniques locaux.** Vitest, React Testing Library, Jest, Supertest, Playwright, les chemins de fichiers et les commandes `npm` correspondent à l’organisation technique décrite par Chantiers360.
- **Seuil de quatre tests.** Il s’agit d’une règle de cette source, pas d’un seuil universel suffisant pour garantir la qualité.
- **Prescription ≠ preuve.** La lecture du fichier ne démontre ni l’exécution des tests, ni leur réussite, ni le respect effectif de ces pratiques dans le dépôt. Aucun test ni build n’a été exécuté pendant cette consultation.
- **Gouvernance partiellement documentée.** Cette source ne suffit pas à établir qui arbitre les conflits métier, accepte les exceptions ou autorise une livraison.
- **Corpus incomplet.** Les enseignements de la première source restent à intégrer après identification et vérification.

## 5. Points à clarifier par le Pilote

1. **Première référence :** quel était son chemin exact et sur quelle branche a-t-elle été consultée ?
2. **Réservation reconnue :** quel événement rend une réservation CampusFlow effective, et quel support fait foi ?
3. **Concurrence :** quelle règle doit s’appliquer à deux demandes sur la même salle et le même créneau ?
4. **Permissions :** qui peut créer, confirmer, modifier, annuler ou arbitrer une réservation ?
5. **Critères de validation :** quelles preuves sont nécessaires avant de considérer un parcours comme validé ?
6. **Organisation de la traçabilité :** où conserver les scénarios, résultats et preuves, et qui les maintient ?
7. **Adoption éventuelle :** quelles pratiques externes le Pilote souhaite-t-il examiner pour CampusFlow, avec quelles adaptations et exceptions ?

**Aucune proposition de ce document ne vaut décision métier ou autorisation de mise en œuvre.**

---

## Résultat de l’opération

| Élément demandé | Résultat réel |
|---|---|
| Enregistrement dans D4 | **Non effectué** : aucun outil de création ou de sauvegarde documentaire n’est disponible dans cette session |
| Identifiant documentaire | Aucun attribué |
| Révision documentaire | Aucune attribuée |
| Où le retrouver | Dans cette réponse uniquement ; il n’est pas présent dans l’espace documentaire D4 |
| Modifications GitHub | Aucune publication, aucun commit, aucune branche créée |

Le texte peut être repris dans l’espace documentaire interne sous le titre demandé. **La première référence reste à compléter avant de considérer la capitalisation des deux sources comme complète.**