# SRG — AUDIT DE MAPPING ET PLAN D'INTÉGRATION

Date: 2026-08-14
Mission: Finalisation et unification — NE PAS RECONSTRUIRE

---

## 1. INVENTAIRE GLOBAL

### Routes (51)
`__root`, `index` (Home), `about`, `account-pending`, `accounting`, `administration`,
`agents`, `attendance`, `auth`, `business-policy`, `categories`, `category.$categorySlug`,
`category.$categorySlug.$subcategorySlug`, `chat`, `conversation.$categorySlug.$subcategorySlug`,
`dashboard`, `devis`, `employees`, `enterprise-insights`, `evaluations`, `finance`,
`finance-budgets`, `finance-customers`, `finance-suppliers`, `generate`, `history`,
`hr-contracts`, `human-resources`, `knowledge-center`, `knowledge-intelligence`, `leaves`,
`maintenance`, `management-control`, `observability`, `organization`, `payroll`,
`procurement-inventory`, `profile`, `project-execution`, `projects`, `prompt-studio`,
`prompt-templates`, `providers`, `recruitment`, `reviews`, `settings`, `skills`,
`strategic-advisor`, `trainings`, `treasury`, `workflow-automation`.

### Sources de navigation
| Source | Rôle | Usage réel |
|---|---|---|
| `navConfig.ts` (navItems, 40 entrées) | Sidebar AppShell, breadcrumbs, command palette, NavigationContext, settings | ACTIF — source de vérité UI |
| `NavigationService.ts` | Wrapper autour de navItems (getNavigationItems, findNavigationItem) | 0 usage direct hors imports |
| `categoryCatalog.ts` | Taxonomie Page 2/3 (6 catégories + sous-catégories) | ACTIF — /categories, /category/$slug |
| `OFFICIAL_SPACES` (chat.tsx) | Ancienne Page 2 — 13 espaces + conversations spécialisées | LEGACY — à migrer |

### État du flux officiel
```
HOME (/)
  → orb Ask SRG : /chat            ⚠ à rebrancher vers /categories
  → submitInput : /chat            ⚠ à rebrancher vers /categories
/categories                        ✅ Page 2 officielle (6 catégories)
/category/$categorySlug            ✅ Page 3 (rail sous-catégories)
/category/$cat/$sub                ✅ redirect vers /conversation/$cat/$sub
/conversation/$cat/$sub            ✅ crée conversation contextuelle puis → /chat
/chat                              ✅ hôte technique ConversationWorkspace
```

Auth: après login/inscription approuvée → `/categories` DÉJÀ EN PLACE.
Compte non approuvé → `/account-pending`.

---

## 2. MATRICE DE CORRESPONDANCE TAXONOMIE

### Legacy 12 domaines (SRG_TAXONOMY_HISTORY) → 13 espaces OFFICIAL_SPACES → taxonomie actuelle

| # | Domaine original (12) | Espace legacy OFFICIAL_SPACES | Catégorie actuelle | Page 3 / sous-catégories | Routes métier | Conversation | Service métier |
|---|---|---|---|---|---|---|---|
| 1 | Documents | `documents` (Rapports, Contrats, Procedures, Courriers) | knowledge | /knowledge-center, /knowledge-intelligence | knowledge-center, knowledge-intelligence | dédiée via /conversation/knowledge/* | KnowledgeWorkspaceService (ACTIF, ZIP réel) + KnowledgeCenterService (catalogue statique) |
| 2 | Finance | `finance` (Comptabilite, Facturation, Paiements, Budgets, Trésorerie) | finance | /accounting, /treasury, /finance-budgets, /finance-customers, /finance-suppliers, /management-control | 7 vues finance | dédiée via /conversation/finance/* | FinanceWorkspaceService |
| 3 | RH | `hr` (Employes, Pointage, Codes affaires, Conges, Paie, Formations, Evaluations) | hr | /employees, /recruitment, /payroll, /trainings, /organization, /hr-contracts, /attendance, /leaves, /skills | 10 vues RH | dédiée via /conversation/hr/* | HumanResourcesWorkspaceService (COMPLET) |
| 4 | Maintenance | `operations.items.maintenance` | operations | /maintenance | maintenance | dédiée | MaintenanceWorkspaceService |
| 5 | Achats | `operations.items.stocks, logistique, fournisseurs` | operations | /procurement-inventory | procurement-inventory | dédiée | ProcurementInventoryWorkspaceService |
| 6 | CRM | `crm` (Prospects, Clients, Contrats) | ⚠ ABSENT de la taxonomie actuelle | /finance-customers (partiel) | finance-customers | ⚠ pas de conversation CRM dédiée | ⚠ pas de service CRM dédié |
| 7 | Qualite | `operations.items.essais` + `meetings.items.comptes-rendus` | operations | /reviews | reviews | dédiée | (revues dans CollaborationWorkspaceService) |
| 8 | Projets | `operations.items.planning, commissioning, mise-en-service` | operations | /project-execution, /projects | project-execution, projects | dédiée | ProjectExecutionWorkspaceService, ProjectService |
| 9 | Workflow | `automation` (Agents IA, Workflows, Prompt Studio, Templates) | automation | /workflow-automation, /agents, /generate, /providers | workflow-automation, agents, generate | dédiée | WorkflowWorkspaceService, AgentWorkspaceService, GenerateWorkspaceService |
| 10 | Knowledge | `knowledge` (Normes, Guides, Documentation, FAQ, Historique) | knowledge | /knowledge-center, /knowledge-intelligence | knowledge-center, knowledge-intelligence | dédiée | KnowledgeWorkspaceService |
| 11 | Analytics | `analyses` (KPI, Insights, Prévisions, Tableaux de bord) | knowledge | /enterprise-insights, /strategic-advisor, /observability, /dashboard | enterprise-insights, strategic-advisor, observability, dashboard | dédiée | EnterpriseInsightsWorkspaceService, StrategicAdvisorWorkspaceService, DashboardService |
| 12 | Administration | `admin` (Utilisateurs, Roles, API, Connecteurs) | governance | /administration, /providers, /settings | administration, providers, settings, auth, profile | dédiée | BusinessFoundationService, AuthAccountService |

### Espaces legacy SANS équivalent direct dans la taxonomie actuelle (à réintégrer)
| Espace legacy | Contenu | Réintégration |
|---|---|---|
| `favoris` | Favoris WhatsApp-like | Fonctionnalité transversale — conservée dans /chat (mécanisme favoris ConversationWorkspaceService) |
| `meetings` | Reunion IA, Comptes rendus, Plans d'action, Decisions | → nouvelle catégorie `meetings` (Réunions) |
| `pages` | Contenus publics/institutionnels (Notre histoire, Blog, Doc, FAQ, Contact) | → rattaché à `governance` ou conservé via /about |
| `settings` (espace) | Apparence, Entreprise, Langues, Notifications, Personnalisation | → déjà dans governance.subcategories (/settings) |
| `crm` | Prospects, Clients, Contrats | → nouvelle catégorie `crm` (P2) |

---

## 3. CONSTATS CLÉS

### CONFIRMÉ FONCTIONNEL (à ne pas casser)
1. **ConversationWorkspaceService** : persistance localStorage, contexte category/subcategory,
   historique, versions, commentaires, revues, export PDF/MD/JSON/HTML/TXT, collections, recherche.
2. **Flux conversation dédié** : /conversation/$cat/$sub crée une conversation titrée
   `"{Catégorie} · {Sous-catégorie}"` avec contexte isolé, puis ouvre /chat (hôte technique).
3. **KnowledgeWorkspaceService** (2047 lignes) : ZIP réel avec garde-fous sécurité
   (taille, chemins, extensions dangereuses), OCR queue, RAG, extraction métadonnées,
   collections, exports. **KnowledgeCenterService** = catalogue statique 6 articles (0 usage à confirmer).
4. **HumanResourcesWorkspaceService** : complet — employees, org, contracts, **payroll**,
   attendance, leaves, skills, trainings, recruitment, evaluations, AI insights, exports CSV/JSON.
   Le composant HumanResourcesWorkspace expose une vue `'payroll'` complète.
5. **Provider Test Center** (/providers) : test par provider, rapport checks, export JSON/Markdown,
   notifications, favori.
6. **Auth** : wizard inscription, matricule, OTP, sessions, récupération mot de passe,
   statut compte (APPROVED/PENDING), redirection → /categories.
7. **Business layer** : billing (BillingEngine, InvoiceEngine, PaymentEngine, SubscriptionEngine,
   CouponEngine, TaxCalculator), credits, wallet, identity/OTP, orchestrator.
8. **Modules métier PASS** : Finance (7 vues), Devis, Business Policy, Operations,
   Project Execution, Procurement, Maintenance, Workflow, Enterprise Insights, Strategic Advisor.
9. **Home** : orb Ask SRG, champ universel, micro (SpeechRecognition), menu +, fichiers,
   caméra, export. Audio réel (micro + speechSynthesis à vérifier dans ConversationWorkspace).

### PROBLÈMES CONFIRMÉS
| # | Problème | Détail | Priorité |
|---|---|---|---|
| P0-1 | Home pointe vers /chat au lieu de /categories | orb onClick + submitInput naviguent vers /chat | P0 |
| P0-2 | navConfig n'a pas d'entrée /categories | La Page 2 officielle est absente de la sidebar | P0 |
| P0-3 | Taxonomie réduite à 6 catégories | Legacy 12 domaines + 13 espaces ; CRM, Meetings, Devis absents | P0 |
| P0-4 | /payroll = stub `Hello "/payroll"!` | Alors que la vue payroll existe dans HumanResourcesWorkspace | P0 |
| P1-1 | Deux services Knowledge | KnowledgeCenterService (statique) vs KnowledgeWorkspaceService (actif) | P1 |
| P1-2 | Deux systèmes navigation | NavigationService (0 usage) vs navConfig (actif) | P1 |
| P2-1 | Conversation = MOCK | `buildAssistantResponse` statique, pas d'appel provider/engine | P2 |
| P2-2 | CRM partiel | Seulement finance-customers ; pas d'entrée CRM dédiée | P2 |
| P2-3 | Monétisation simulée | Wallet/crédits/billing présents mais paiements simulés | P2 |
| P3-1 | Dossiers placeholders | src/connectors, src/agents, src/cli, src/shared = index.ts vides | P3 |
| P3-2 | Moteurs non branchés | src/prompt, src/knowledge complets mais non utilisés par l'UI | P3 |

---

## 4. PLAN D'INTÉGRATION

### P0 — Navigation / Page 2 / Taxonomie / Conversations
1. **Home** : orb Ask SRG et submitInput → `/categories` (au lieu de /chat).
   La commande vocale/textuelle universelle ouvre la Page 2 officielle.
2. **navConfig** : ajouter l'entrée `categories` (Page 2 officielle) en tête de navigation.
3. **categoryCatalog** : restaurer la taxonomie complète — 12 domaines legacy représentés :
   - finance (existant, enrichi)
   - hr (existant)
   - operations (existant, enrichi : devis, business-policy, chantier/pointage)
   - knowledge (existant)
   - automation (existant)
   - governance (existant, enrichi : administration)
   - **crm** (nouveau : prospects, clients, contrats — sans dupliquer finance-customers)
   - **meetings** (nouveau : reunion-ia, comptes-rendus, plans-action, decisions)
   - **documents** (nouveau : rapports, contrats, procedures, courriers → knowledge)
   - **projects** (nouveau : planning, execution, projets)
   - **analytics** (nouveau : kpi, insights, previsions, tableaux de bord)
   - **quality** (nouveau : revues qualité, essais)
   Chaque catégorie garde ses sous-catégories propres (pas de sous-catégorie générale).
4. **/payroll** : remplacer le stub par la page réelle utilisant
   `HumanResourcesWorkspace initialView="payroll"` (pattern human-resources.tsx).

### P0 — Conversations
- Le mécanisme /conversation/$cat/$sub existe et isole le contexte. Aucune régression.
- Les nouvelles catégories/sous-catégories du catalog bénéficieront automatiquement
  de conversations dédiées.
- /chat reste l'hôte technique (ConversationWorkspace) — pas de suppression.

### P1 — Unification Knowledge Center
- KnowledgeWorkspaceService = moteur actif (ZIP, OCR, RAG). Le conserver comme source.
- KnowledgeCenterService = catalogue statique d'articles. Le **fusionner** :
  exposer les articles statiques comme documents seed dans KnowledgeWorkspaceService,
  puis router knowledge-center.tsx sur KnowledgeWorkspaceService.
- Vérifier que la route /knowledge-center utilise KnowledgeWorkspaceService (à confirmer).

### P1 — Unification navigation
- navConfig = source de vérité (utilisé par AppShell, breadcrumbs, command palette).
- NavigationService : le conserver comme façade fine au-dessus de navConfig s'il est
  utilisé par le kernel, sinon marquer déprécié. Pas de suppression immédiate.

### P1 — Intégration modules métier
- Finance : 7 vues déjà accessibles via finance.subcategories. Vérifier liaison Devis/Business Policy.
- Devis, Business Policy, Operations : ajouter comme sous-catégories operations.
- Projects : catégorie dédiée + sous-catégories (project-execution, projects, planning).
- Chantiers/Pointage : attendance (pointage) déjà dans hr ; chantier = project-execution.

### P2 — Moteurs / Providers / Conversation réelle
- L'architecture providers (BaseProvider, ProviderFactory, Registry, OpenAIProvider, MockProvider)
  existe. Connecter ConversationWorkspaceService.sendMessage à cette architecture :
  si un provider réel est configuré (clé présente), appel réel ; sinon MockProvider explicite.
- Ne jamais présenter un mock comme une IA opérationnelle : statut visible dans l'UI.
- Provider Test Center : déjà fonctionnel — vérifier rapport → History/Knowledge.

### P2 — CRM
- Créer la catégorie `crm` : prospects (conversation dédiée), clients (→ finance-customers
  existant, pas de duplication), contrats (→ hr-contracts ou futur CRM contracts).

### P2 — Monétisation
- Conserver wallet/crédits/billing/abonnements simulés.
- Marquer explicitement : IMPLEMENTED (wallet, credits, engines), SIMULATED (paiements),
  NOT CONNECTED (passerelle réelle), PRODUCTION READY (aucun paiement réel).

### P3 — Dossiers déconnectés
- src/prompt, src/knowledge : moteurs complets — marquer "FUTUR — moteur non branché à l'UI",
  documenter le point d'intégration prévu (GenerateWorkspaceService / KnowledgeWorkspaceService).
- src/connectors, src/agents, src/cli, src/shared : placeholders index.ts — marquer "FUTUR".
- Aucune suppression.

---

## 5. RÈGLES APPLIQUÉES
- Aucune fonctionnalité supprimée sans équivalent vérifié.
- Taxonomie étendue, jamais réduite.
- /chat conservé comme hôte technique de conversation.
- Home non modifiée visuellement, seulement rebranchée.
- Modules PASS non modifiés sans raison.