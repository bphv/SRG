/**
 * SRG — KNOWLEDGE ENGINE MÉTIER V1
 *
 * Couche de connaissances métier construite AU-DESSUS de l'architecture validée.
 * Aucune architecture parallèle : ce registre est consommé par
 * ConversationWorkspaceService (contexte des conversations dédiées) et
 * KnowledgeWorkspaceService (documents seed métier).
 *
 * Principe fondamental :
 * - VERIFIED  : connaissance documentée dans la base SRG (document importé ou seed).
 * - GENERATED : contenu produit par SRG à partir du modèle métier (plan, estimation,
 *               procédure générique) — toujours étiqueté comme tel.
 * - MISSING   : information technique absente de la base ; SRG doit demander le
 *               document ou la précision (ex. manuel constructeur) au lieu d'inventer.
 */

export type TradeKnowledgeKind = 'VERIFIED' | 'GENERATED' | 'MISSING'

export type TradeProcedure = {
  id: string
  title: string
  steps: string[]
  safetyNotes: string[]
  kind: TradeKnowledgeKind
  verificationNote?: string
}

export type TradeQuestionProfile = {
  id: string
  question: string
  intent: string
  requiredInputs: string[]
  missingDataPolicy: string
}

export type TradeReportTemplate = {
  id: string
  title: string
  sections: string[]
  outputFormats: Array<'markdown' | 'pdf' | 'json'>
}

export type TradeTool = {
  id: string
  label: string
  kind: 'calculation' | 'checklist' | 'lookup' | 'estimation'
  description: string
  kindStatus: TradeKnowledgeKind
}

export type TradeDocumentRequirement = {
  id: string
  label: string
  purpose: string
  mandatory: boolean
}

export type TradeLimit = {
  id: string
  statement: string
  action: 'ask-document' | 'ask-precision' | 'refer-manual' | 'declare-generated'
}

export type TradeProfile = {
  id: string
  label: string
  categorySlug: string
  subcategorySlugs: string[]
  description: string
  knowledgeDomains: string[]
  questionProfiles: TradeQuestionProfile[]
  procedures: TradeProcedure[]
  reportTemplates: TradeReportTemplate[]
  tools: TradeTool[]
  documentRequirements: TradeDocumentRequirement[]
  limits: TradeLimit[]
  seedDocuments: Array<{ title: string; summary: string; collection: string; tags: string[] }>
}

/**
 * Registre officiel des métiers SRG.
 * Chaque métier est rattaché à une catégorie officielle et à ses sous-catégories.
 */
export const TRADE_PROFILES: TradeProfile[] = [
  // ------------------------------------------------------------------
  // 1. MÉCANIQUE AUTOMOBILE — Operations > maintenance
  // ------------------------------------------------------------------
  {
    id: 'trade-auto-mechanics',
    label: 'Mécanique automobile',
    categorySlug: 'operations',
    subcategorySlugs: ['maintenance'],
    description:
      'Diagnostic, schémas techniques, procédures d\'entretien, couples de serrage et composants pour véhicules. SRG distingue les données constructeur vérifiées des estimations générées.',
    knowledgeDomains: [
      'Circuits de freinage (schémas, composants, symptômes)',
      'Moteurs thermiques (distribution, injection, refroidissement)',
      'Circuits électriques véhicule (démarrage, charge, éclairage)',
      'Liaisons au sol (suspension, direction, pneumatiques)',
      'Couples de serrage et fluides (huiles, liquides de frein)',
      'Diagnostic par symptômes et codes défaut',
    ],
    questionProfiles: [
      {
        id: 'auto-q1',
        question: 'Schéma du circuit de freinage d\'un véhicule donné',
        intent: 'Obtenir le schéma fonctionnel du circuit de freinage avec composants',
        requiredInputs: ['marque', 'modele', 'version/motorisation', 'annee'],
        missingDataPolicy:
          'Si le modèle exact est absent de la base documentée, SRG fournit un schéma fonctionnel GENERIQUE étiqueté GENERATED et demande le manuel constructeur pour les valeurs spécifiques (couples, diamètres, références).',
      },
      {
        id: 'auto-q2',
        question: 'Diagnostic d\'un symptôme (bruit, vibration, fuite, témoin)',
        intent: 'Identifier les causes probables et la procédure de contrôle',
        requiredInputs: ['symptome', 'conditions', 'marque', 'modele', 'kilometrage'],
        missingDataPolicy:
          'SRG propose une arborescence de diagnostic générique et signale les mesures à vérifier au manuel constructeur.',
      },
      {
        id: 'auto-q3',
        question: 'Couples de serrage et spécifications',
        intent: 'Obtenir les valeurs de serrage et spécifications fluides',
        requiredInputs: ['marque', 'modele', 'motorisation', 'organe'],
        missingDataPolicy:
          'Les couples de serrage sont des données constructeur : sans document vérifié dans la base, SRG déclare MISSING et demande le manuel. Aucune valeur inventée.',
      },
    ],
    procedures: [
      {
        id: 'auto-p1',
        title: 'Diagnostic circuit de freinage (procédure générique)',
        steps: [
          'Vérifier le niveau et l\'état du liquide de frein (couleur, âge).',
          'Contrôler visuellement les flexibles et canalisations (fuites, corrosion).',
          'Mesurer l\'épaisseur des plaquettes et l\'état des disques (cotes mini constructeur).',
          'Vérifier le servofrein : pédale dure moteur coupé, assistance au démarrage.',
          'Contrôler le répartiteur et le témoin d\'usure si équipé.',
          'Essai statique puis essai routier prudent : freinage progressif, ABS.',
        ],
        safetyNotes: [
          'Ne jamais réutiliser un liquide de frein ouvert depuis longtemps.',
          'Purge dans l\'ordre constructeur (généralement du plus loin au plus près du maître-cylindre).',
          'Vérifier l\'étanchéité après toute intervention avant essai routier.',
        ],
        kind: 'GENERATED',
        verificationNote:
          'Procédure générique SRG. Les cotes, couples et références doivent être vérifiés au manuel constructeur du véhicule concerné.',
      },
    ],
    reportTemplates: [
      {
        id: 'auto-r1',
        title: 'Rapport de diagnostic véhicule',
        sections: [
          'Identification véhicule (marque, modèle, version, année, km)',
          'Symptôme déclaré et conditions',
          'Contrôles effectués et mesures',
          'Causes probables classées',
          'Pièces et documents à vérifier (références constructeur)',
          'Recommandations et estimation',
          'Statut des données : VERIFIED / GENERATED / MISSING',
        ],
        outputFormats: ['markdown', 'pdf', 'json'],
      },
    ],
    tools: [
      {
        id: 'auto-t1',
        label: 'Arborescence de diagnostic par symptôme',
        kind: 'lookup',
        description: 'Carte symptôme → causes probables → contrôles.',
        kindStatus: 'GENERATED',
      },
      {
        id: 'auto-t2',
        label: 'Recherche couples de serrage',
        kind: 'lookup',
        description:
          'Interroge la base documentaire SRG ; si absent, déclare MISSING et demande le manuel constructeur.',
        kindStatus: 'MISSING',
      },
    ],
    documentRequirements: [
      {
        id: 'auto-d1',
        label: 'Manuel constructeur / revue technique',
        purpose: 'Valeurs de serrage, cotes, schémas spécifiques, références pièces',
        mandatory: true,
      },
      {
        id: 'auto-d2',
        label: 'Historique d\'entretien du véhicule',
        purpose: 'Contexte des interventions précédentes',
        mandatory: false,
      },
    ],
    limits: [
      {
        id: 'auto-l1',
        statement:
          'Les couples de serrage, cotes et références pièces ne sont jamais inventés : sans document vérifié, SRG déclare l\'information manquante.',
        action: 'refer-manual',
      },
      {
        id: 'auto-l2',
        statement:
          'Un schéma fourni sans document constructeur dans la base est un schéma fonctionnel générique, étiqueté GENERATED.',
        action: 'declare-generated',
      },
      {
        id: 'auto-l3',
        statement:
          'SRG demande systématiquement marque/modèle/version/année avant toute réponse technique véhicule.',
        action: 'ask-precision',
      },
    ],
    seedDocuments: [
      {
        title: 'Circuit de freinage — schéma fonctionnel générique',
        summary:
          'Schéma fonctionnel d\'un circuit de freinage hydraulique double circuit : maître-cylindre, servofrein, répartiteur, flexibles, étriers/cylindres de roue, ABS. Document GENERIQUE SRG — les valeurs spécifiques doivent provenir du manuel constructeur.',
        collection: 'Mécanique automobile',
        tags: ['freinage', 'schema', 'generique', 'automobile'],
      },
      {
        title: 'Arborescence de diagnostic — symptômes freinage',
        summary:
          'Carte de diagnostic : pédale molle, pédale dure, bruit, vibration, tirage, témoin ABS. Causes probables et contrôles associés. Contenu générique SRG.',
        collection: 'Mécanique automobile',
        tags: ['diagnostic', 'freinage', 'symptomes'],
      },
    ],
  },

  // ------------------------------------------------------------------
  // 2. ÉLECTRICITÉ / ÉLECTRONIQUE — Operations > maintenance
  // ------------------------------------------------------------------
  {
    id: 'trade-electronics',
    label: 'Électricité / Électronique',
    categorySlug: 'operations',
    subcategorySlugs: ['maintenance'],
    description:
      'Schémas fonctionnels de blocs d\'alimentation et circuits, diagnostic par mesures, composants, protections. SRG distingue schémas documentés et schémas génériques générés.',
    knowledgeDomains: [
      'Blocs d\'alimentation linéaires et à découpage',
      'Électronique de puissance (redressement, filtrage, régulation)',
      'Mesures oscilloscope/multimètre et points de test',
      'Composants passifs et actifs (valeurs, tolérances, derating)',
      'Protections (fusibles, varistances, TVS, thermiques)',
      'Normes de sécurité électrique (habilitation, consignation)',
    ],
    questionProfiles: [
      {
        id: 'elec-q1',
        question: 'Schéma fonctionnel d\'un bloc d\'alimentation',
        intent: 'Obtenir la chaîne fonctionnelle entrée/sortie avec étages',
        requiredInputs: ['type (lineaire/decoupage)', 'tension entree', 'tension/courant sortie'],
        missingDataPolicy:
          'SRG produit un schéma fonctionnel GENERATED (étages : EMI, redressement, filtrage, conversion, régulation, protection). Le schéma exact d\'un appareil commercial exige sa documentation technique.',
      },
      {
        id: 'elec-q2',
        question: 'Diagnostic d\'une carte ou d\'un équipement',
        intent: 'Localiser la panne par mesures successives',
        requiredInputs: ['symptome', 'equipement', 'conditions', 'historique'],
        missingDataPolicy:
          'SRG fournit une procédure de diagnostic par étapes avec points de mesure génériques ; les valeurs nominales spécifiques doivent provenir de la documentation de l\'équipement.',
      },
    ],
    procedures: [
      {
        id: 'elec-p1',
        title: 'Diagnostic bloc d\'alimentation (procédure générique)',
        steps: [
          'Consigner / mettre hors tension avant toute intervention interne.',
          'Contrôle visuel : composants brûlés, condensateurs gonflés, pistes coupées.',
          'Mesurer l\'entrée (tension secteur, fusible, filtre EMI).',
          'Mesurer le bus DC après redressement/filtrage.',
          'Vérifier l\'étage de conversion (transfo, MOSFET/IGBT, driver).',
          'Mesurer les sorties en charge et l\'ondulation résiduelle.',
          'Contrôler la boucle de régulation et les protections (OVP, OCP, thermique).',
        ],
        safetyNotes: [
          'Décharger les condensateurs haute tension avant contact.',
          'Respecter l\'habilitation électrique et la consignation.',
          'Utiliser un transformateur d\'isolement pour les mesures sous tension.',
        ],
        kind: 'GENERATED',
        verificationNote:
          'Procédure générique SRG. Les valeurs nominales et points de test spécifiques proviennent de la documentation de l\'équipement.',
      },
    ],
    reportTemplates: [
      {
        id: 'elec-r1',
        title: 'Rapport de diagnostic électronique',
        sections: [
          'Identification équipement (marque, modèle, série)',
          'Symptôme et conditions de panne',
          'Mesures effectuées (points, valeurs attendues/mesurées)',
          'Composants suspects et tests',
          'Pièces à remplacer (références)',
          'Recommandations et prévention',
          'Statut des données : VERIFIED / GENERATED / MISSING',
        ],
        outputFormats: ['markdown', 'pdf', 'json'],
      },
    ],
    tools: [
      {
        id: 'elec-t1',
        label: 'Générateur de schéma fonctionnel par étages',
        kind: 'estimation',
        description: 'Produit la chaîne fonctionnelle d\'une alimentation selon les spécifications fournies.',
        kindStatus: 'GENERATED',
      },
      {
        id: 'elec-t2',
        label: 'Table de mesures types par étage',
        kind: 'checklist',
        description: 'Points de mesure, instrument attendu, ordre de test.',
        kindStatus: 'GENERATED',
      },
    ],
    documentRequirements: [
      {
        id: 'elec-d1',
        label: 'Documentation technique de l\'équipement',
        purpose: 'Schémas exacts, valeurs nominales, références composants',
        mandatory: true,
      },
    ],
    limits: [
      {
        id: 'elec-l1',
        statement:
          'Le schéma exact d\'un appareil commercial n\'est fourni que si sa documentation est présente dans la base SRG ; sinon SRG fournit un schéma fonctionnel générique étiqueté GENERATED.',
        action: 'declare-generated',
      },
      {
        id: 'elec-l2',
        statement:
          'Les interventions sous tension exigent habilitation et équipements de protection ; SRG le rappelle systématiquement.',
        action: 'refer-manual',
      },
    ],
    seedDocuments: [
      {
        title: 'Bloc d\'alimentation à découpage — schéma fonctionnel générique',
        summary:
          'Chaîne fonctionnelle : entrée secteur → filtre EMI → redressement → filtrage → découpage (MOSFET + transfo) → redressement secondaire → filtrage → régulation → protections. Document GENERIQUE SRG.',
        collection: 'Électricité / Électronique',
        tags: ['alimentation', 'schema', 'decoupage', 'generique'],
      },
      {
        title: 'Checklist de mesures — diagnostic alimentation',
        summary:
          'Points de mesure par étage, instruments, précautions sécurité. Contenu générique SRG.',
        collection: 'Électricité / Électronique',
        tags: ['diagnostic', 'mesures', 'checklist'],
      },
    ],
  },

  // ------------------------------------------------------------------
  // 3. BÂTIMENT / MAÇONNERIE — Projects > project-execution
  // ------------------------------------------------------------------
  {
    id: 'trade-masonry',
    label: 'Bâtiment / Maçonnerie',
    categorySlug: 'projects',
    subcategorySlugs: ['project-execution'],
    description:
      'Plans conceptuels, métrés, matériaux, implantation et étapes de construction. SRG produit des plans conceptuels GENERATED et signale les données à valider par un professionnel habilité.',
    knowledgeDomains: [
      'Plans conceptuels de bâtiments (duplex, villas, locaux)',
      'Distribution des pièces et dimensions indicatives',
      'Métrés et estimation des matériaux (parpaings, ciment, fer, béton)',
      'Implantation et terrassement',
      'Étapes de construction (fondations → gros œuvre → second œuvre)',
      'Normes de sécurité chantier bâtiment',
    ],
    questionProfiles: [
      {
        id: 'bat-q1',
        question: 'Plan conceptuel d\'un bâtiment (ex. duplex 4 chambres)',
        intent: 'Obtenir un plan conceptuel avec distribution, dimensions indicatives et estimation matériaux',
        requiredInputs: ['type de batiment', 'nombre de pieces/chambres', 'surface approximative', 'nombre de niveaux', 'terrain (si connu)'],
        missingDataPolicy:
          'SRG produit un plan conceptuel GENERATED avec dimensions indicatives. Le plan d\'exécution définitif doit être validé par un architecte/ingénieur habilité. SRG demande les précisions manquantes (terrain, budget, contraintes locales).',
      },
      {
        id: 'bat-q2',
        question: 'Métrés et estimation matériaux',
        intent: 'Estimer les quantités de matériaux pour un ouvrage',
        requiredInputs: ['type ouvrage', 'dimensions', 'localisation (prix locaux si besoin)'],
        missingDataPolicy:
          'SRG fournit une estimation GENERATED basée sur ratios génériques. Les prix et ratios locaux doivent être vérifiés ; SRG signale les données manquantes.',
      },
    ],
    procedures: [
      {
        id: 'bat-p1',
        title: 'Élaboration plan conceptuel (procédure SRG)',
        steps: [
          'Collecter le programme : type de bâtiment, nombre de pièces, niveaux, surface cible.',
          'Proposer une distribution des pièces par niveau avec surfaces indicatives.',
          'Définir les circulations (escalier, couloirs) et orientations.',
          'Estimer les dimensions globales et l\'emprise au sol.',
          'Produire une estimation matériaux préliminaire (ratios génériques).',
          'Lister les questions à poser avant finalisation (terrain, réglementation, budget).',
          'Rappeler la nécessité de validation par professionnel habilité.',
        ],
        safetyNotes: [
          'Un plan conceptuel ne remplace pas un plan d\'exécution d\'architecte/ingénieur.',
          'Les normes locales (urbanisme, parasismique) doivent être vérifiées.',
        ],
        kind: 'GENERATED',
        verificationNote:
          'Procédure SRG. Les plans produits sont conceptuels et doivent être validés par un professionnel habilité avant construction.',
      },
    ],
    reportTemplates: [
      {
        id: 'bat-r1',
        title: 'Rapport plan conceptuel bâtiment',
        sections: [
          'Programme et contraintes collectées',
          'Distribution des pièces par niveau',
          'Dimensions indicatives et emprise au sol',
          'Estimation matériaux préliminaire (ratios génériques)',
          'Étapes de construction proposées',
          'Questions à poser avant finalisation',
          'Statut des données : VERIFIED / GENERATED / MISSING',
        ],
        outputFormats: ['markdown', 'pdf', 'json'],
      },
    ],
    tools: [
      {
        id: 'bat-t1',
        label: 'Estimateur matériaux par ratios',
        kind: 'estimation',
        description: 'Estime parpaings, ciment, fer, béton à partir de surfaces/volumes (ratios génériques GENERATED).',
        kindStatus: 'GENERATED',
      },
      {
        id: 'bat-t2',
        label: 'Checklist questions avant finalisation',
        kind: 'checklist',
        description: 'Liste des points à clarifier avec le client et les professionnels.',
        kindStatus: 'GENERATED',
      },
    ],
    documentRequirements: [
      {
        id: 'bat-d1',
        label: 'Plan de masse / relevé terrain',
        purpose: 'Implantation, orientation, contraintes du site',
        mandatory: false,
      },
      {
        id: 'bat-d2',
        label: 'Réglementation locale d\'urbanisme',
        purpose: 'Hauteur maximale, retraits, COS',
        mandatory: false,
      },
    ],
    limits: [
      {
        id: 'bat-l1',
        statement:
          'Les plans SRG sont conceptuels (GENERATED) et ne remplacent jamais un plan d\'exécution validé par un professionnel habilité.',
        action: 'declare-generated',
      },
      {
        id: 'bat-l2',
        statement:
          'Les ratios matériaux et prix sont génériques : SRG demande les données locales pour affiner l\'estimation.',
        action: 'ask-precision',
      },
    ],
    seedDocuments: [
      {
        title: 'Guide plan conceptuel — méthode SRG',
        summary:
          'Méthode d\'élaboration d\'un plan conceptuel : programme, distribution, dimensions indicatives, estimation préliminaire, questions de finalisation. Document GENERATED SRG.',
        collection: 'Bâtiment / Maçonnerie',
        tags: ['plan', 'conceptuel', 'batiment', 'methode'],
      },
      {
        title: 'Ratios matériaux génériques — gros œuvre',
        summary:
          'Ratios indicatifs : parpaings/m², ciment/m³ de mortier, fer/m³ de béton. Valeurs génériques GENERATED à vérifier localement.',
        collection: 'Bâtiment / Maçonnerie',
        tags: ['metres', 'materiaux', 'ratios', 'estimation'],
      },
    ],
  },

  // ------------------------------------------------------------------
  // 4. CHANTIER — Projects > project-execution
  // ------------------------------------------------------------------
  {
    id: 'trade-site-management',
    label: 'Chef de chantier',
    categorySlug: 'projects',
    subcategorySlugs: ['project-execution'],
    description:
      'Planning, pointage, avancement, équipes, rapports de chantier. SRG exploite les modules Projects/Attendance existants et produit des rapports de chantier structurés.',
    knowledgeDomains: [
      'Planning et phasage de chantier',
      'Pointage des équipes et suivi des heures',
      'Avancement physique et financier',
      'Rapports journaliers/hebdomadaires de chantier',
      'Gestion des aléas et réclamations',
      'Sécurité et EPI sur chantier',
    ],
    questionProfiles: [
      {
        id: 'chant-q1',
        question: 'Rapport de chantier (journalier ou hebdomadaire)',
        intent: 'Produire un rapport structuré d\'avancement de chantier',
        requiredInputs: ['chantier', 'periode', 'effectifs', 'taches realisees', 'aleas'],
        missingDataPolicy:
          'SRG collecte les données depuis les modules Projects/Attendance si disponibles ; sinon demande les informations manquantes (effectifs, tâches, aléas).',
      },
      {
        id: 'chant-q2',
        question: 'Pointage et suivi des heures',
        intent: 'Enregistrer et exploiter le pointage des équipes',
        requiredInputs: ['chantier', 'equipe', 'date', 'heures'],
        missingDataPolicy:
          'SRG utilise le module Attendance existant. Si les données de pointage sont absentes, SRG demande la saisie ou l\'import des pointages.',
      },
    ],
    procedures: [
      {
        id: 'chant-p1',
        title: 'Rapport de chantier hebdomadaire (procédure SRG)',
        steps: [
          'Collecter l\'avancement des tâches depuis le module Projects.',
          'Récupérer le pointage des équipes depuis Attendance.',
          'Lister les aléas, réclamations et décisions de la période.',
          'Synthétiser l\'avancement physique (% par lot) et financier.',
          'Produire le rapport structuré avec plan d\'action semaine suivante.',
          'Exporter le rapport (markdown/pdf/json).',
        ],
        safetyNotes: [
          'Vérifier la conformité EPI et les incidents sécurité avant validation du rapport.',
        ],
        kind: 'GENERATED',
        verificationNote:
          'Procédure SRG exploitant les modules Projects et Attendance existants.',
      },
    ],
    reportTemplates: [
      {
        id: 'chant-r1',
        title: 'Rapport de chantier',
        sections: [
          'Identification chantier et période',
          'Effectifs et pointage (heures travaillées)',
          'Avancement par lot (%)',
          'Aléas, réclamations, décisions',
          'Sécurité (incidents, EPI)',
          'Plan d\'action période suivante',
          'Statut des données : VERIFIED / GENERATED / MISSING',
        ],
        outputFormats: ['markdown', 'pdf', 'json'],
      },
    ],
    tools: [
      {
        id: 'chant-t1',
        label: 'Synthèse pointage par équipe',
        kind: 'calculation',
        description: 'Agrège les heures pointées par équipe/chantier depuis Attendance.',
        kindStatus: 'VERIFIED',
      },
      {
        id: 'chant-t2',
        label: 'Suivi avancement par lot',
        kind: 'lookup',
        description: 'Lit l\'avancement depuis le module Projects.',
        kindStatus: 'VERIFIED',
      },
    ],
    documentRequirements: [
      {
        id: 'chant-d1',
        label: 'Planning de chantier',
        purpose: 'Référence des délais et jalons',
        mandatory: false,
      },
    ],
    limits: [
      {
        id: 'chant-l1',
        statement:
          'Les rapports de chantier SRG agrègent les données des modules Projects/Attendance ; si une donnée est absente, SRG la signale MISSING et demande la saisie.',
        action: 'ask-precision',
      },
    ],
    seedDocuments: [
      {
        title: 'Modèle rapport de chantier hebdomadaire',
        summary:
          'Structure type d\'un rapport de chantier : identification, effectifs, avancement, aléas, sécurité, plan d\'action. Modèle GENERATED SRG.',
        collection: 'Chantier',
        tags: ['chantier', 'rapport', 'modele', 'hebdomadaire'],
      },
    ],
  },

  // ------------------------------------------------------------------
  // 5. GESTION DE PROJET — Projects > projects-portfolio
  // ------------------------------------------------------------------
  {
    id: 'trade-project-management',
    label: 'Gestion de projet',
    categorySlug: 'projects',
    subcategorySlugs: ['projects-portfolio'],
    description:
      'Accompagnement de projets : objectifs, tâches, planning, documents, rapports, suivi. SRG exploite les modules Projects et ProjectService existants.',
    knowledgeDomains: [
      'Cadrage projet (objectifs, périmètre, livrables)',
      'Planification (tâches, jalons, dépendances)',
      'Suivi d\'avancement et risques',
      'Documents et rapports projet',
      'Clôture et retour d\'expérience',
    ],
    questionProfiles: [
      {
        id: 'proj-q1',
        question: 'Accompagnement d\'un projet (cadrage → suivi)',
        intent: 'Structurer un projet : objectifs, tâches, planning, suivi',
        requiredInputs: ['nom projet', 'objectifs', 'contraintes', 'echeances'],
        missingDataPolicy:
          'SRG structure le projet dans le module Projects existant. Si des informations manquent (objectifs, échéances), SRG les demande avant de créer les tâches.',
      },
    ],
    procedures: [
      {
        id: 'proj-p1',
        title: 'Accompagnement projet (procédure SRG)',
        steps: [
          'Collecter objectifs, périmètre, contraintes et échéances.',
          'Décomposer en tâches et jalons dans le module Projects.',
          'Associer documents et rapports au projet.',
          'Suivre l\'avancement et les risques en conversation dédiée.',
          'Produire les rapports de suivi (markdown/pdf/json).',
        ],
        safetyNotes: [],
        kind: 'GENERATED',
        verificationNote: 'Procédure SRG exploitant ProjectService et ProjectExecutionWorkspaceService.',
      },
    ],
    reportTemplates: [
      {
        id: 'proj-r1',
        title: 'Rapport de suivi projet',
        sections: [
          'Identification projet et période',
          'Avancement des tâches et jalons',
          'Risques et mitigations',
          'Documents associés',
          'Prochaines étapes',
          'Statut des données : VERIFIED / GENERATED / MISSING',
        ],
        outputFormats: ['markdown', 'pdf', 'json'],
      },
    ],
    tools: [
      {
        id: 'proj-t1',
        label: 'Lecture avancement projet',
        kind: 'lookup',
        description: 'Lit l\'avancement depuis ProjectService.',
        kindStatus: 'VERIFIED',
      },
    ],
    documentRequirements: [
      {
        id: 'proj-d1',
        label: 'Charte projet / cahier des charges',
        purpose: 'Référence des objectifs et périmètre',
        mandatory: false,
      },
    ],
    limits: [
      {
        id: 'proj-l1',
        statement:
          'SRG structure et suit le projet dans les modules existants ; les données de planning saisies par l\'utilisateur font foi.',
        action: 'ask-precision',
      },
    ],
    seedDocuments: [
      {
        title: 'Guide gestion de projet SRG',
        summary:
          'Méthode SRG : cadrage, décomposition en tâches, suivi, rapports. Exploite ProjectService. Document GENERATED SRG.',
        collection: 'Gestion de projet',
        tags: ['projet', 'methode', 'cadrage', 'suivi'],
      },
    ],
  },

  // ------------------------------------------------------------------
  // 6. FINANCE / COMPTABILITÉ — Finance > accounting
  // ------------------------------------------------------------------
  {
    id: 'trade-finance',
    label: 'Finance / Comptabilité',
    categorySlug: 'finance',
    subcategorySlugs: ['accounting', 'treasury', 'budgets', 'finance-overview'],
    description:
      'Comptabilité, trésorerie, budgets, rapports financiers. SRG exploite FinanceWorkspaceService (7 vues) et produit des rapports financiers structurés.',
    knowledgeDomains: [
      'Comptabilité générale (journal, grand livre, balance)',
      'Trésorerie et rapprochement bancaire',
      'Budgets et contrôle de gestion',
      'Facturation clients/fournisseurs',
      'Rapports financiers (P&L, bilan, cash-flow)',
    ],
    questionProfiles: [
      {
        id: 'fin-q1',
        question: 'Rapport financier / analyse de comptes',
        intent: 'Produire une synthèse ou un rapport financier',
        requiredInputs: ['perimetre (entite/compte)', 'periode', 'indicateurs demandes'],
        missingDataPolicy:
          'SRG lit les données depuis FinanceWorkspaceService. Si les données sont absentes, SRG demande l\'import ou la saisie des écritures.',
      },
    ],
    procedures: [
      {
        id: 'fin-p1',
        title: 'Production rapport financier (procédure SRG)',
        steps: [
          'Collecter le périmètre et la période.',
          'Lire les données depuis FinanceWorkspaceService.',
          'Calculer les indicateurs demandés.',
          'Produire le rapport structuré (markdown/pdf/json).',
          'Signaler les données manquantes ou incohérentes.',
        ],
        safetyNotes: [
          'Les rapports SRG sont des aides à la décision ; la comptabilité officielle fait foi.',
        ],
        kind: 'GENERATED',
        verificationNote: 'Procédure SRG exploitant FinanceWorkspaceService.',
      },
    ],
    reportTemplates: [
      {
        id: 'fin-r1',
        title: 'Rapport financier',
        sections: [
          'Périmètre et période',
          'Synthèse des comptes',
          'Indicateurs clés',
          'Écarts et alertes',
          'Recommandations',
          'Statut des données : VERIFIED / GENERATED / MISSING',
        ],
        outputFormats: ['markdown', 'pdf', 'json'],
      },
    ],
    tools: [
      {
        id: 'fin-t1',
        label: 'Lecture données finance',
        kind: 'lookup',
        description: 'Lit les vues Finance depuis FinanceWorkspaceService.',
        kindStatus: 'VERIFIED',
      },
    ],
    documentRequirements: [
      {
        id: 'fin-d1',
        label: 'Écritures comptables / relevés',
        purpose: 'Source des données financières',
        mandatory: true,
      },
    ],
    limits: [
      {
        id: 'fin-l1',
        statement:
          'SRG ne certifie pas de données comptables officielles ; il produit des synthèses à partir des données saisies.',
        action: 'declare-generated',
      },
    ],
    seedDocuments: [
      {
        title: 'Guide rapports financiers SRG',
        summary:
          'Méthode SRG : collecte, calcul d\'indicateurs, production de rapports financiers. Document GENERATED SRG.',
        collection: 'Finance / Comptabilité',
        tags: ['finance', 'rapport', 'comptabilite', 'methode'],
      },
    ],
  },

  // ------------------------------------------------------------------
  // 7. RESSOURCES HUMAINES — HR > hr-overview
  // ------------------------------------------------------------------
  {
    id: 'trade-hr',
    label: 'Ressources humaines',
    categorySlug: 'hr',
    subcategorySlugs: ['employees', 'payroll', 'attendance', 'hr-overview'],
    description:
      'Employés, paie, présences, congés, rapports RH. SRG exploite HumanResourcesWorkspaceService (11 vues) et produit des rapports RH structurés.',
    knowledgeDomains: [
      'Gestion des employés et dossiers',
      'Paie et bulletins',
      'Présences et pointage',
      'Congés et absences',
      'Rapports RH (effectifs, masse salariale)',
    ],
    questionProfiles: [
      {
        id: 'rh-q1',
        question: 'Rapport RH / synthèse paie ou effectifs',
        intent: 'Produire une synthèse RH ou un rapport de paie',
        requiredInputs: ['perimetre (service/periode)', 'indicateurs demandes'],
        missingDataPolicy:
          'SRG lit les données depuis HumanResourcesWorkspaceService. Si les données sont absentes, SRG demande la saisie ou l\'import.',
      },
    ],
    procedures: [
      {
        id: 'rh-p1',
        title: 'Production rapport RH (procédure SRG)',
        steps: [
          'Collecter le périmètre et la période.',
          'Lire les données depuis HumanResourcesWorkspaceService.',
          'Calculer les indicateurs demandés (effectifs, masse salariale, absences).',
          'Produire le rapport structuré (markdown/pdf/json).',
          'Signaler les données manquantes.',
        ],
        safetyNotes: [
          'Les données RH sont confidentielles ; respecter les droits d\'accès.',
        ],
        kind: 'GENERATED',
        verificationNote: 'Procédure SRG exploitant HumanResourcesWorkspaceService.',
      },
    ],
    reportTemplates: [
      {
        id: 'rh-r1',
        title: 'Rapport RH',
        sections: [
          'Périmètre et période',
          'Effectifs et mouvements',
          'Paie et masse salariale',
          'Absences et congés',
          'Alertes et recommandations',
          'Statut des données : VERIFIED / GENERATED / MISSING',
        ],
        outputFormats: ['markdown', 'pdf', 'json'],
      },
    ],
    tools: [
      {
        id: 'rh-t1',
        label: 'Lecture données RH',
        kind: 'lookup',
        description: 'Lit les vues RH depuis HumanResourcesWorkspaceService.',
        kindStatus: 'VERIFIED',
      },
    ],
    documentRequirements: [
      {
        id: 'rh-d1',
        label: 'Données employés / paie',
        purpose: 'Source des données RH',
        mandatory: true,
      },
    ],
    limits: [
      {
        id: 'rh-l1',
        statement:
          'SRG produit des synthèses RH à partir des données saisies ; les bulletins officiels font foi.',
        action: 'declare-generated',
      },
    ],
    seedDocuments: [
      {
        title: 'Guide rapports RH SRG',
        summary:
          'Méthode SRG : collecte, calcul d\'indicateurs RH, production de rapports. Document GENERATED SRG.',
        collection: 'Ressources humaines',
        tags: ['rh', 'rapport', 'paie', 'effectifs'],
      },
    ],
  },

  // ------------------------------------------------------------------
  // 8. CRM / COMMERCIAL — CRM > crm-clients
  // ------------------------------------------------------------------
  {
    id: 'trade-crm',
    label: 'CRM / Commercial',
    categorySlug: 'crm',
    subcategorySlugs: ['crm-clients', 'crm-prospects', 'crm-contracts'],
    description:
      'Clients, prospects, contrats, suivi relation client. SRG exploite les données finance-customers existantes (pas de duplication) et produit des rapports commerciaux.',
    knowledgeDomains: [
      'Gestion clients et prospects',
      'Suivi des contrats commerciaux',
      'Revue clients et historique',
      'Rapports commerciaux (pipeline, CA)',
    ],
    questionProfiles: [
      {
        id: 'crm-q1',
        question: 'Rapport commercial / revue clients',
        intent: 'Produire une synthèse commerciale ou une revue client',
        requiredInputs: ['perimetre (client/segment)', 'periode', 'indicateurs demandes'],
        missingDataPolicy:
          'SRG lit les données depuis finance-customers. Si les données sont absentes, SRG demande la saisie.',
      },
    ],
    procedures: [
      {
        id: 'crm-p1',
        title: 'Production rapport commercial (procédure SRG)',
        steps: [
          'Collecter le périmètre et la période.',
          'Lire les données clients depuis finance-customers.',
          'Calculer les indicateurs demandés.',
          'Produire le rapport structuré (markdown/pdf/json).',
        ],
        safetyNotes: [],
        kind: 'GENERATED',
        verificationNote: 'Procédure SRG exploitant les données clients existantes.',
      },
    ],
    reportTemplates: [
      {
        id: 'crm-r1',
        title: 'Rapport commercial',
        sections: [
          'Périmètre et période',
          'Clients et prospects',
          'Contrats en cours',
          'Indicateurs clés',
          'Actions recommandées',
          'Statut des données : VERIFIED / GENERATED / MISSING',
        ],
        outputFormats: ['markdown', 'pdf', 'json'],
      },
    ],
    tools: [
      {
        id: 'crm-t1',
        label: 'Lecture données clients',
        kind: 'lookup',
        description: 'Lit les données depuis finance-customers.',
        kindStatus: 'VERIFIED',
      },
    ],
    documentRequirements: [
      {
        id: 'crm-d1',
        label: 'Données clients / contrats',
        purpose: 'Source des données commerciales',
        mandatory: true,
      },
    ],
    limits: [
      {
        id: 'crm-l1',
        statement:
          'SRG produit des synthèses commerciales à partir des données saisies ; aucune donnée client n\'est inventée.',
        action: 'declare-generated',
      },
    ],
    seedDocuments: [
      {
        title: 'Guide rapports commerciaux SRG',
        summary:
          'Méthode SRG : collecte, calcul d\'indicateurs commerciaux, production de rapports. Document GENERATED SRG.',
        collection: 'CRM / Commercial',
        tags: ['crm', 'rapport', 'clients', 'commercial'],
      },
    ],
  },

  // ------------------------------------------------------------------
  // 9. QUALITÉ — Quality > quality-reviews
  // ------------------------------------------------------------------
  {
    id: 'trade-quality',
    label: 'Qualité',
    categorySlug: 'quality',
    subcategorySlugs: ['quality-reviews'],
    description:
      'Revues qualité, essais, validation, conformité. SRG exploite PromptReviewService et produit des rapports qualité structurés.',
    knowledgeDomains: [
      'Revues qualité et modération',
      'Essais et validation',
      'Conformité et non-conformités',
      'Rapports qualité',
    ],
    questionProfiles: [
      {
        id: 'qual-q1',
        question: 'Rapport qualité / revue de conformité',
        intent: 'Produire une synthèse qualité ou une revue de conformité',
        requiredInputs: ['perimetre', 'periode', 'criteres qualite'],
        missingDataPolicy:
          'SRG lit les données depuis PromptReviewService. Si les données sont absentes, SRG demande la saisie.',
      },
    ],
    procedures: [
      {
        id: 'qual-p1',
        title: 'Production rapport qualité (procédure SRG)',
        steps: [
          'Collecter le périmètre et la période.',
          'Lire les données depuis PromptReviewService.',
          'Synthétiser les revues et décisions.',
          'Produire le rapport structuré (markdown/pdf/json).',
        ],
        safetyNotes: [],
        kind: 'GENERATED',
        verificationNote: 'Procédure SRG exploitant PromptReviewService.',
      },
    ],
    reportTemplates: [
      {
        id: 'qual-r1',
        title: 'Rapport qualité',
        sections: [
          'Périmètre et période',
          'Revues effectuées',
          'Décisions et statuts',
          'Non-conformités',
          'Actions correctives',
          'Statut des données : VERIFIED / GENERATED / MISSING',
        ],
        outputFormats: ['markdown', 'pdf', 'json'],
      },
    ],
    tools: [
      {
        id: 'qual-t1',
        label: 'Lecture revues qualité',
        kind: 'lookup',
        description: 'Lit les revues depuis PromptReviewService.',
        kindStatus: 'VERIFIED',
      },
    ],
    documentRequirements: [
      {
        id: 'qual-d1',
        label: 'Référentiel qualité / critères',
        purpose: 'Référence des critères de conformité',
        mandatory: false,
      },
    ],
    limits: [
      {
        id: 'qual-l1',
        statement:
          'SRG produit des synthèses qualité à partir des revues saisies ; la certification officielle relève d\'organismes habilités.',
        action: 'declare-generated',
      },
    ],
    seedDocuments: [
      {
        title: 'Guide rapports qualité SRG',
        summary:
          'Méthode SRG : collecte, synthèse des revues, production de rapports qualité. Document GENERATED SRG.',
        collection: 'Qualité',
        tags: ['qualite', 'rapport', 'revue', 'conformite'],
      },
    ],
  },

  // ------------------------------------------------------------------
  // 10. DOCUMENTS / ADMINISTRATION — Documents > docs-reports
  // ------------------------------------------------------------------
  {
    id: 'trade-documents',
    label: 'Documents / Administration',
    categorySlug: 'documents',
    subcategorySlugs: ['docs-reports', 'docs-procedures', 'docs-generate'],
    description:
      'Rapports, contrats, procédures, courriers. SRG exploite KnowledgeWorkspaceService et GenerateWorkspaceService pour produire et gérer les documents.',
    knowledgeDomains: [
      'Rapports et comptes rendus',
      'Contrats et courriers',
      'Procédures et modes opératoires',
      'Génération et export de documents',
    ],
    questionProfiles: [
      {
        id: 'doc-q1',
        question: 'Génération d\'un rapport ou document',
        intent: 'Produire un document structuré à partir de données ou d\'une conversation',
        requiredInputs: ['type document', 'contenu/donnees', 'format'],
        missingDataPolicy:
          'SRG génère le document à partir des données disponibles. Si des données manquent, SRG les demande avant génération.',
      },
    ],
    procedures: [
      {
        id: 'doc-p1',
        title: 'Génération document (procédure SRG)',
        steps: [
          'Collecter le type de document et les données.',
          'Structurer le contenu selon le modèle.',
          'Générer le document (markdown/pdf/json).',
          'Archiver dans KnowledgeWorkspaceService si demandé.',
        ],
        safetyNotes: [],
        kind: 'GENERATED',
        verificationNote: 'Procédure SRG exploitant GenerateWorkspaceService et KnowledgeWorkspaceService.',
      },
    ],
    reportTemplates: [
      {
        id: 'doc-r1',
        title: 'Document générique',
        sections: [
          'Titre et contexte',
          'Contenu principal',
          'Annexes et références',
          'Statut des données : VERIFIED / GENERATED / MISSING',
        ],
        outputFormats: ['markdown', 'pdf', 'json'],
      },
    ],
    tools: [
      {
        id: 'doc-t1',
        label: 'Génération document',
        kind: 'estimation',
        description: 'Génère un document structuré depuis les données fournies.',
        kindStatus: 'GENERATED',
      },
    ],
    documentRequirements: [
      {
        id: 'doc-d1',
        label: 'Données sources du document',
        purpose: 'Contenu à structurer',
        mandatory: true,
      },
    ],
    limits: [
      {
        id: 'doc-l1',
        statement:
          'Les documents générés par SRG sont étiquetés GENERATED ; les documents officiels importés sont VERIFIED.',
        action: 'declare-generated',
      },
    ],
    seedDocuments: [
      {
        title: 'Guide génération documents SRG',
        summary:
          'Méthode SRG : collecte, structuration, génération, archivage. Document GENERATED SRG.',
        collection: 'Documents / Administration',
        tags: ['documents', 'rapport', 'generation', 'administration'],
      },
    ],
  },
]

export function getTradeProfiles(): TradeProfile[] {
  return TRADE_PROFILES
}

export function getTradeProfileById(tradeId: string): TradeProfile | undefined {
  return TRADE_PROFILES.find((profile) => profile.id === tradeId)
}

/**
 * Résout les métiers applicables à un couple catégorie/sous-catégorie.
 * Utilisé par la route conversation pour injecter le contexte métier.
 */
export function getTradeProfilesFor(categorySlug: string, subcategorySlug?: string): TradeProfile[] {
  return TRADE_PROFILES.filter((profile) => {
    if (profile.categorySlug !== categorySlug) return false
    if (!subcategorySlug) return true
    return profile.subcategorySlugs.includes(subcategorySlug)
  })
}

/**
 * Injecte les documents seed des métiers dans KnowledgeWorkspaceService.
 * À appeler une fois au démarrage ou à la demande (idempotent par titre).
 */
export function seedTradeDocuments(knowledgeService: {
  addDocument: (payload: {
    title: string
    description: string
    content: string
    documentType: 'guide' | 'documentation' | 'technical-plan' | 'report'
    category: string
    tags: string[]
    source: string
    author: string
  }) => unknown
  getStore: () => { documents: Array<{ title: string }> }
}): number {
  const existingTitles = new Set(knowledgeService.getStore().documents.map((doc) => doc.title))
  let created = 0

  for (const profile of TRADE_PROFILES) {
    for (const seed of profile.seedDocuments) {
      if (existingTitles.has(seed.title)) continue
      knowledgeService.addDocument({
        title: seed.title,
        description: seed.summary,
        content: seed.summary,
        documentType: 'guide',
        category: seed.collection,
        tags: seed.tags,
        source: 'trade-knowledge-registry',
        author: 'SRG Knowledge Engine',
      })
      created += 1
    }
  }

  return created
}

/**
 * Construit le bloc de contexte métier injecté dans une conversation dédiée.
 * Contient : domaines, procédures, limites, documents requis, politique MISSING.
 */
export function buildTradeContextBlock(categorySlug: string, subcategorySlug?: string): string | undefined {
  const profiles = getTradeProfilesFor(categorySlug, subcategorySlug)
  if (profiles.length === 0) return undefined

  const lines: string[] = ['CONTEXTE METIER SRG:']
  for (const profile of profiles) {
    lines.push(`- Metier: ${profile.label}`)
    lines.push(`  Domaines: ${profile.knowledgeDomains.join(' | ')}`)
    for (const procedure of profile.procedures) {
      lines.push(`  Procedure [${procedure.kind}]: ${procedure.title}`)
    }
    for (const limit of profile.limits) {
      lines.push(`  Limite (${limit.action}): ${limit.statement}`)
    }
    const mandatoryDocs = profile.documentRequirements.filter((doc) => doc.mandatory)
    if (mandatoryDocs.length > 0) {
      lines.push(`  Documents requis: ${mandatoryDocs.map((doc) => doc.label).join(', ')}`)
    }
  }
  lines.push('REGLE: ne jamais presenter une donnee GENERATED comme VERIFIED; signaler MISSING quand une information technique fait defaut et demander le document ou la precision necessaire.')
  return lines.join('\n')
}
