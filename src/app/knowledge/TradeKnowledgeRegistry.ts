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
export const TRADE_PROFILES: TradeProfile[] = []

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
    return profile.subcategorySlugs.includes(subcategorySlug)
  })
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
  return lines.join('
')
}
