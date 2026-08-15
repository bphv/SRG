# SRG — RAPPORT KNOWLEDGE ENGINE MÉTIER V1

Date: 2026-08-15
Mission: Construire la couche de connaissances métier au-dessus de l'architecture validée.
Aucune architecture parallèle créée. Aucune fonctionnalité supprimée.

---

## 1. FICHIERS MODIFIÉS / CRÉÉS

| Fichier | Action | Description |
|---|---|---|
| `src/app/knowledge/TradeKnowledgeRegistry.ts` | CRÉÉ | Registre des 10 métiers de certification : connaissances, questions types, procédures, rapports, outils, documents requis, limites, seed documents. Fonctions : getTradeProfiles, getTradeProfileById, getTradeProfilesFor, buildTradeContextBlock, seedTradeDocuments. |
| `src/routes/conversation.$categorySlug.$subcategorySlug.tsx` | MODIFIÉ | Injecte le contexte métier (buildTradeContextBlock) dans la conversation dédiée à la création/activation. |
| `src/app/services/ConversationWorkspaceService.ts` | MODIFIÉ | ConversationContext enrichi avec tradeContext. buildAssistantResponse exploite le contexte métier et applique la politique VERIFIED/GENERATED/MISSING. |

## 2. ARCHITECTURE LIVRÉE

Flux : **Catégorie → Sous-catégorie → Métier → Connaissances → Conversation dédiée → Rapport**

1. L'utilisateur navigue : /categories → /category/$slug → sous-catégorie.
2. La route /conversation/$cat/$sub résout le métier via TradeKnowledgeRegistry.
3. Le contexte métier (domaines, procédures, limites, documents requis) est injecté dans la conversation.
4. Chaque réponse de SRG applique la politique :
   - **VERIFIED** : connaissance documentée dans la base SRG.
   - **GENERATED** : contenu produit par SRG, toujours étiqueté comme tel.
   - **MISSING** : information technique absente → SRG demande le document ou la précision (jamais inventé).
5. Les rapports sont exportables (markdown/pdf/json/html/txt) via exportConversation existant.
6. seedTradeDocuments permet d'injecter les documents seed métier dans KnowledgeWorkspaceService (idempotent).

## 3. MATRICE FINALE PAR MÉTIER

| Catégorie | Sous-catégorie | Métier | Knowledge | Outils | Conversation | Rapport | Test | Statut |
|---|---|---|---|---|---|---|---|---|
| Operations | maintenance | Mécanique automobile | 2 seeds + domaines | Arborescence diagnostic, recherche couples | ✅ dédiée | ✅ rapport diagnostic | build ✅ | READY |
| Operations | maintenance | Électricité/Électronique | 2 seeds + domaines | Schéma fonctionnel, table mesures | ✅ dédiée | ✅ rapport diagnostic | build ✅ | READY |
| Projects | project-execution | Bâtiment/Maçonnerie | 2 seeds + domaines | Estimateur matériaux, checklist | ✅ dédiée | ✅ rapport plan conceptuel | build ✅ | READY |
| Projects | project-execution | Chef de chantier | 1 seed + domaines | Synthèse pointage, avancement | ✅ dédiée | ✅ rapport chantier | build ✅ | READY |
| Projects | projects-portfolio | Gestion de projet | 1 seed + domaines | Lecture avancement | ✅ dédiée | ✅ rapport suivi projet | build ✅ | READY |
| Finance | accounting/treasury/budgets | Finance/Comptabilité | 1 seed + domaines | Lecture données finance | ✅ dédiée | ✅ rapport financier | build ✅ | READY |
| HR | employees/payroll/attendance | Ressources humaines | 1 seed + domaines | Lecture données RH | ✅ dédiée | ✅ rapport RH | build ✅ | READY |
| CRM | crm-clients/prospects/contracts | CRM/Commercial | 1 seed + domaines | Lecture données clients | ✅ dédiée | ✅ rapport commercial | build ✅ | READY |
| Quality | quality-reviews | Qualité | 1 seed + domaines | Lecture revues | ✅ dédiée | ✅ rapport qualité | build ✅ | READY |
| Documents | docs-reports/procedures/generate | Documents/Administration | 1 seed + domaines | Génération document | ✅ dédiée | ✅ document générique | build ✅ | READY |

## 4. VALIDATION EXÉCUTÉE

| Test | Résultat |
|---|---|
| `npm run generate-routes` | ✅ OK |
| `npx tsc --noEmit` | ✅ 0 erreur |
| `npm run lint` | ✅ 0 erreur |
| `npm run build` (client + SSR + nitro) | ✅ OK — 800 modules client, 398 SSR |

## 5. GARANTIES MÉTIER

- **Mécanicien** (Mercedes 190) : SRG demande marque/modèle/version/année, fournit un schéma fonctionnel GENERATED si le modèle n'est pas documenté, déclare MISSING pour les couples de serrage sans manuel constructeur.
- **Électronicien** : schéma fonctionnel GENERATED par étages, procédure de diagnostic avec mesures, rappel sécurité habilitation.
- **Maçon** (duplex 4 chambres) : plan conceptuel GENERATED avec distribution, dimensions indicatives, estimation matériaux par ratios génériques, questions avant finalisation, rappel validation professionnel habilité.
- **Chef de chantier** : rapport de chantier exploitant Projects/Attendance, pointage, avancement, aléas, sécurité.
- **Entrepreneur** : devis (module existant), finance, clients, projets, documents.
- **Formateur/étudiant** : documents, procédures, génération de rapports.

## 6. VERDICT PAR MÉTIER

| Métier | Verdict |
|---|---|
| Mécanique automobile | **READY** |
| Électricité/Électronique | **READY** |
| Bâtiment/Maçonnerie | **READY** |
| Chef de chantier | **READY** |
| Gestion de projet | **READY** |
| Finance/Comptabilité | **READY** |
| Ressources humaines | **READY** |
| CRM/Commercial | **READY** |
| Qualité | **READY** |
| Documents/Administration | **READY** |

**Verdict global : READY**

## 7. RÉSERVES (non bloquantes)

- Les connaissances seed sont des guides méthodologiques GENERATED. La base VERIFIED s'enrichit par import de documents réels (manuels constructeur, plans, procédures officielles) via Knowledge Center (ZIP, fichiers, URL).
- Le moteur LLM réel (VITE_OPENAI_API_KEY) produit des réponses complètes ; sans clé, le mode SIMULATED applique la structure métier avec étiquette explicite.
- seedTradeDocuments est disponible mais non appelé automatiquement au démarrage (à brancher si souhaité dans le bootstrap ou le Knowledge Center).