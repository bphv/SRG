import { notificationService } from '#/app/services/NotificationService'
import { AgentWorkspaceService } from '#/app/services/AgentWorkspaceService'
import { ConversationWorkspaceService } from '#/app/services/ConversationWorkspaceService'
import { DashboardService } from '#/app/services/DashboardService'
import { FinanceWorkspaceService } from '#/app/services/FinanceWorkspaceService'
import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { HumanResourcesWorkspaceService } from '#/app/services/HumanResourcesWorkspaceService'
import { KnowledgeWorkspaceService } from '#/app/services/KnowledgeWorkspaceService'
import { MaintenanceWorkspaceService } from '#/app/services/MaintenanceWorkspaceService'
import { ProcurementInventoryWorkspaceService } from '#/app/services/ProcurementInventoryWorkspaceService'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'
import { ProviderWorkspaceService } from '#/app/services/ProviderWorkspaceService'
import { WorkflowWorkspaceService } from '#/app/services/WorkflowWorkspaceService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export type InsightView =
  | 'executive'
  | 'finance'
  | 'hr'
  | 'maintenance'
  | 'procurement'
  | 'crm'
  | 'projects'
  | 'ai'
  | 'documents'
  | 'workflows'

export type RecommendationPriority = 'high' | 'medium' | 'low'

export type EnterpriseRecommendation = {
  id: string
  view: InsightView
  title: string
  description: string
  priority: RecommendationPriority
  impact: number
  urgency: number
  confidence: number
  source: string
  justification: string
  createdAt: string
}

export type DecisionRecordType = 'decision' | 'recommendation' | 'comparison'

export type DecisionHistoryItem = {
  id: string
  type: DecisionRecordType
  title: string
  detail: string
  source: string
  createdAt: string
}

export type InsightEventType = 'risk' | 'opportunity' | 'recommendation' | 'prediction' | 'alert'

export type InsightEvent = {
  id: string
  type: InsightEventType
  view: InsightView
  title: string
  detail: string
  severity: RecommendationPriority
  createdAt: string
}

export type InsightMetricRecord = {
  date: string
  riskCount: number
  opportunityCount: number
  recommendationCount: number
  predictionCount: number
  avgConfidence: number
}

export type TransverseAnalysis = {
  evolution: string[]
  comparisons: string[]
  gaps: string[]
  trends: string[]
  correlations: string[]
  anomalies: string[]
  bestPerformances: string[]
  weakPoints: string[]
  alerts: string[]
  opportunities: string[]
}

export type AssistantAnswer = {
  question: string
  answer: string
  confidence: number
  source: string
  justification: string
}

export type EnterpriseInsightsStore = {
  decisionHistory: DecisionHistoryItem[]
  recommendationHistory: DecisionHistoryItem[]
  comparisonHistory: DecisionHistoryItem[]
  events: InsightEvent[]
  metricsHistory: InsightMetricRecord[]
}

const STORAGE_KEY = 'srg.enterprise.insights.workspace.v1'

function nowIso(): string {
  return new Date().toISOString()
}

function todayKey(dateValue: string = nowIso()): string {
  return dateValue.slice(0, 10)
}

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function toPercent(part: number, total: number): number {
  if (total <= 0) return 0
  return Number(((part / total) * 100).toFixed(1))
}

function fallbackStore(): EnterpriseInsightsStore {
  return {
    decisionHistory: [],
    recommendationHistory: [],
    comparisonHistory: [],
    events: [],
    metricsHistory: [],
  }
}

function priorityScore(priority: RecommendationPriority): number {
  if (priority === 'high') return 3
  if (priority === 'medium') return 2
  return 1
}

function byPriorityThenConfidence(left: EnterpriseRecommendation, right: EnterpriseRecommendation): number {
  const priorityDelta = priorityScore(right.priority) - priorityScore(left.priority)
  if (priorityDelta !== 0) return priorityDelta
  return right.confidence - left.confidence
}

export class EnterpriseInsightsWorkspaceService {
  private static memoryStore: EnterpriseInsightsStore = fallbackStore()

  static getStore(): EnterpriseInsightsStore {
    if (typeof window === 'undefined') {
      return this.memoryStore
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const seed = fallbackStore()
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
        return seed
      }

      const parsed = JSON.parse(raw) as Partial<EnterpriseInsightsStore>
      const seed = fallbackStore()
      return {
        decisionHistory: Array.isArray(parsed.decisionHistory) ? parsed.decisionHistory : seed.decisionHistory,
        recommendationHistory: Array.isArray(parsed.recommendationHistory) ? parsed.recommendationHistory : seed.recommendationHistory,
        comparisonHistory: Array.isArray(parsed.comparisonHistory) ? parsed.comparisonHistory : seed.comparisonHistory,
        events: Array.isArray(parsed.events) ? parsed.events : seed.events,
        metricsHistory: Array.isArray(parsed.metricsHistory) ? parsed.metricsHistory : seed.metricsHistory,
      }
    } catch {
      return fallbackStore()
    }
  }

  private static persist(store: EnterpriseInsightsStore): void {
    this.memoryStore = store
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    }
  }

  static getInsightsViews() {
    const finance = FinanceWorkspaceService.getSummary()
    const hr = HumanResourcesWorkspaceService.getSummary()
    const maintenance = MaintenanceWorkspaceService.getSummary()
    const procurement = ProcurementInventoryWorkspaceService.getSummary()
    const projects = ProjectExecutionWorkspaceService.getSummary()
    const workflows = WorkflowWorkspaceService.getDashboardSummary()
    const workflowObservability = WorkflowWorkspaceService.getObservability()
    const documents = KnowledgeWorkspaceService.getSummary()
    const conversation = ConversationWorkspaceService.getGlobalSummary()
    const agents = AgentWorkspaceService.getSummary()
    const providers = ProviderWorkspaceService.list()
    const dashboard = DashboardService.getMetrics()
    const history = HistoryWorkspaceService.getRecords()

    const enabledProviders = providers.filter((item) => item.status === 'enabled')
    const degradedProviders = providers.filter((item) => item.health === 'degraded' || item.health === 'offline')
    const failedRuns = history.filter((item) => item.status === 'failed').length

    return {
      executive: {
        revenue: finance.revenue,
        margin: finance.margin,
        cashFlow: finance.cashFlow,
        projectDelays: projects.delays,
        openRisks: projects.risks + maintenance.failures + procurement.openNonConformities,
        workflowFailures: workflows.failed,
        failedRuns,
      },
      finance,
      hr,
      maintenance,
      procurement,
      crm: {
        activeConversations: conversation.active,
        archivedConversations: conversation.archived,
        topProviders: conversation.topProviders,
        topConversations: conversation.topConversations,
        lifecycle: conversation.lifecycle,
      },
      projects,
      ai: {
        enabledProviders: enabledProviders.length,
        degradedProviders: degradedProviders.length,
        averageGenerationTime: dashboard.averageGenerationTime,
        successRate: dashboard.successRate,
        totalExecutions: agents.totalExecutions,
        failures: agents.failures,
        retries: agents.retries,
      },
      documents,
      workflows: {
        summary: workflows,
        observability: workflowObservability,
      },
    }
  }

  static buildRecommendations(): EnterpriseRecommendation[] {
    const views = this.getInsightsViews()
    const projectStore = ProjectExecutionWorkspaceService.getStore()
    const maintenanceStore = MaintenanceWorkspaceService.getStore()
    const procurementStore = ProcurementInventoryWorkspaceService.getStore()
    const hrStore = HumanResourcesWorkspaceService.getStore()
    const workflowLogs = WorkflowWorkspaceService.listLogs()

    const delayedProjects = projectStore.planning.filter((item) => item.delayedDays > 0)
    const riskyEquipments = maintenanceStore.equipments.filter((item) => item.healthScore < 70 || item.status === 'failure')
    const bestSuppliers = [...procurementStore.suppliers].sort((left, right) => right.automaticRating - left.automaticRating).slice(0, 3)
    const weakSuppliers = [...procurementStore.suppliers].sort((left, right) => left.onTimeRate - right.onTimeRate).slice(0, 3)
    const lowEvaluationEmployees = hrStore.evaluations.filter((item) => item.score < 3.5)
    const failedWorkflows = workflowLogs.filter((item) => item.status === 'failed')

    const recommendations: EnterpriseRecommendation[] = [
      {
        id: id('rec'),
        view: 'projects',
        title: 'Reduce delayed project milestones',
        description: `${delayedProjects.length} planning milestones are delayed and require schedule recovery.` ,
        priority: delayedProjects.length > 2 ? 'high' : delayedProjects.length > 0 ? 'medium' : 'low',
        impact: clamp(40 + delayedProjects.length * 12, 10, 100),
        urgency: clamp(30 + delayedProjects.length * 15, 10, 100),
        confidence: delayedProjects.length > 0 ? 92 : 70,
        source: 'ProjectExecutionWorkspaceService.getStore().planning',
        justification: 'Delayed milestones directly affect delivery and contractual performance.',
        createdAt: nowIso(),
      },
      {
        id: id('rec'),
        view: 'maintenance',
        title: 'Mitigate equipment failure risk',
        description: `${riskyEquipments.length} equipment assets show degraded health or failure status.`,
        priority: riskyEquipments.length > 3 ? 'high' : riskyEquipments.length > 0 ? 'medium' : 'low',
        impact: clamp(35 + riskyEquipments.length * 14, 10, 100),
        urgency: clamp(35 + riskyEquipments.length * 12, 10, 100),
        confidence: riskyEquipments.length > 0 ? 90 : 68,
        source: 'MaintenanceWorkspaceService.getStore().equipments',
        justification: 'Low health score and failure status increase unplanned downtime and cost.',
        createdAt: nowIso(),
      },
      {
        id: id('rec'),
        view: 'procurement',
        title: 'Consolidate with top-performing suppliers',
        description: bestSuppliers.length > 0
          ? `Top suppliers by performance: ${bestSuppliers.map((item) => `${item.name} (${item.automaticRating})`).join(', ')}.`
          : 'No supplier ranking data available.',
        priority: bestSuppliers.length > 0 ? 'medium' : 'low',
        impact: bestSuppliers.length > 0 ? 74 : 40,
        urgency: 48,
        confidence: bestSuppliers.length > 0 ? 84 : 60,
        source: 'ProcurementInventoryWorkspaceService.getStore().suppliers',
        justification: 'Supplier performance history can reduce lead time variance and quality incidents.',
        createdAt: nowIso(),
      },
      {
        id: id('rec'),
        view: 'procurement',
        title: 'Monitor weak supplier delivery reliability',
        description: weakSuppliers.length > 0
          ? `Lowest on-time rates: ${weakSuppliers.map((item) => `${item.name} (${item.onTimeRate}%)`).join(', ')}.`
          : 'No weak supplier identified.',
        priority: weakSuppliers.some((item) => item.onTimeRate < 75) ? 'high' : 'medium',
        impact: weakSuppliers.length > 0 ? 72 : 35,
        urgency: weakSuppliers.some((item) => item.onTimeRate < 75) ? 82 : 55,
        confidence: weakSuppliers.length > 0 ? 83 : 58,
        source: 'ProcurementInventoryWorkspaceService.getStore().suppliers',
        justification: 'Poor delivery reliability is a leading indicator for schedule and stock risk.',
        createdAt: nowIso(),
      },
      {
        id: id('rec'),
        view: 'hr',
        title: 'Target training for low evaluation employees',
        description: `${lowEvaluationEmployees.length} evaluations are below target score 3.5.`,
        priority: lowEvaluationEmployees.length > 2 ? 'high' : lowEvaluationEmployees.length > 0 ? 'medium' : 'low',
        impact: clamp(30 + lowEvaluationEmployees.length * 16, 10, 100),
        urgency: clamp(25 + lowEvaluationEmployees.length * 15, 10, 100),
        confidence: lowEvaluationEmployees.length > 0 ? 86 : 64,
        source: 'HumanResourcesWorkspaceService.getStore().evaluations',
        justification: 'Performance evaluation signals support targeted capability development planning.',
        createdAt: nowIso(),
      },
      {
        id: id('rec'),
        view: 'workflows',
        title: 'Prioritize failing workflows remediation',
        description: `${failedWorkflows.length} workflow executions ended in failed state.`,
        priority: failedWorkflows.length > 1 ? 'high' : failedWorkflows.length > 0 ? 'medium' : 'low',
        impact: clamp(34 + failedWorkflows.length * 20, 10, 100),
        urgency: clamp(36 + failedWorkflows.length * 16, 10, 100),
        confidence: failedWorkflows.length > 0 ? 91 : 66,
        source: 'WorkflowWorkspaceService.listLogs()',
        justification: 'Repeated workflow failures reduce automation ROI and increase manual fallback load.',
        createdAt: nowIso(),
      },
      {
        id: id('rec'),
        view: 'executive',
        title: 'Protect cash flow and margin trend',
        description: `Cash flow ${views.finance.cashFlow.toFixed(2)} with budget variance ${views.finance.budgetVariance.toFixed(2)}.` ,
        priority: views.finance.budgetVariance > 0 ? 'high' : 'medium',
        impact: 88,
        urgency: views.finance.budgetVariance > 0 ? 80 : 56,
        confidence: 82,
        source: 'FinanceWorkspaceService.getSummary()',
        justification: 'Budget variance and cash generation are top-level steering metrics for executive decisions.',
        createdAt: nowIso(),
      },
    ]

    return recommendations.sort(byPriorityThenConfidence)
  }

  static getTransverseAnalysis(): TransverseAnalysis {
    const insights = this.getInsightsViews()
    const recommendations = this.buildRecommendations()
    const projectStore = ProjectExecutionWorkspaceService.getStore()
    const workflowLogs = WorkflowWorkspaceService.listLogs()

    const failedWorkflowRate = toPercent(
      workflowLogs.filter((item) => item.status === 'failed').length,
      workflowLogs.length,
    )
    const delayRate = toPercent(
      projectStore.planning.filter((item) => item.delayedDays > 0).length,
      projectStore.planning.length,
    )
    const providerRiskRate = toPercent(insights.ai.degradedProviders, Math.max(1, insights.ai.enabledProviders + insights.ai.degradedProviders))

    return {
      evolution: [
        `Generation success rate baseline: ${insights.ai.successRate}.`,
        `Workflow success/failure: ${insights.workflows.summary.successRate}% / ${insights.workflows.summary.failureRate}%.`,
        `HR leave pending level: ${insights.hr.leavePending}.`,
      ],
      comparisons: [
        `Project delays (${insights.projects.delays}) vs workflow failures (${insights.workflows.summary.failed}).`,
        `Procurement incidents (${insights.procurement.incidents}) vs maintenance failures (${insights.maintenance.failures}).`,
        `Customer overdue (${insights.finance.customerOverdue}) vs supplier overdue (${insights.finance.supplierOverdue}).`,
      ],
      gaps: [
        `Budget variance gap: ${insights.finance.budgetVariance.toFixed(2)}.`,
        `Training gap signal from low evaluation population.`,
        `Stock resilience gap: ${insights.procurement.lowStock} low-stock items.`,
      ],
      trends: [
        `Project delay rate: ${delayRate}% over planning entries.`,
        `Workflow failure rate: ${failedWorkflowRate}% over automation logs.`,
        `Provider degradation rate: ${providerRiskRate}% over enabled provider base.`,
      ],
      correlations: [
        'Higher delayed milestones often coincide with higher procurement incidents.',
        'Workflow failures and degraded provider health can increase execution fallback workload.',
        'Low equipment health and spare part thresholds often move together.',
      ],
      anomalies: [
        insights.procurement.lowStock > 0 ? `Anomaly: ${insights.procurement.lowStock} stock items under threshold.` : 'No low-stock anomaly detected.',
        insights.workflows.summary.failed > 0 ? `Anomaly: ${insights.workflows.summary.failed} failed workflow executions.` : 'No workflow execution anomaly detected.',
        insights.maintenance.failures > 0 ? `Anomaly: ${insights.maintenance.failures} maintenance failure records.` : 'No maintenance failure anomaly detected.',
      ],
      bestPerformances: [
        `Top workflow success: ${insights.workflows.summary.successRate}%.`,
        `Best AI throughput indicator: ${insights.ai.totalExecutions} agent executions.`,
        `Knowledge indexation coverage: ${insights.documents.indexations}/${insights.documents.documents}.`,
      ],
      weakPoints: [
        `Weak point: project delays (${insights.projects.delays}).`,
        `Weak point: open non-conformities (${insights.procurement.openNonConformities}).`,
        `Weak point: pending leave approvals (${insights.hr.leavePending}).`,
      ],
      alerts: recommendations
        .filter((item) => item.priority === 'high')
        .slice(0, 6)
        .map((item) => `${item.title} | urgency ${item.urgency} | confidence ${item.confidence}%`),
      opportunities: [
        `Opportunity: capitalize on top suppliers and improve delivery SLAs.`,
        `Opportunity: extend successful workflows across modules (${insights.workflows.summary.active} active).`,
        `Opportunity: use document intelligence (${insights.documents.edi.enterpriseAnswers} AI answers) for faster decisions.`,
      ],
    }
  }

  static getAssistantAnswers(): AssistantAnswer[] {
    const views = this.getInsightsViews()
    const projectStore = ProjectExecutionWorkspaceService.getStore()
    const maintenanceStore = MaintenanceWorkspaceService.getStore()
    const procurementStore = ProcurementInventoryWorkspaceService.getStore()
    const hrStore = HumanResourcesWorkspaceService.getStore()
    const failedWorkflows = WorkflowWorkspaceService.listLogs().filter((item) => item.status === 'failed')

    const delayed = projectStore.planning.filter((item) => item.delayedDays > 0)
    const riskyEquipments = maintenanceStore.equipments.filter((item) => item.healthScore < 70 || item.status === 'failure')
    const topSuppliers = [...procurementStore.suppliers].sort((left, right) => right.automaticRating - left.automaticRating).slice(0, 3)
    const lowEvaluation = hrStore.evaluations.filter((item) => item.score < 3.5)

    return [
      {
        question: 'What should be monitored today?',
        answer: [
          `${views.projects.delays} delayed project milestones`,
          `${views.procurement.lowStock} low-stock items`,
          `${views.workflows.summary.failed} failed workflows`,
          `${views.maintenance.failures} maintenance failures`,
        ].join(' | '),
        confidence: 90,
        source: 'ProjectExecution + Procurement + Workflow + Maintenance summaries',
        justification: 'These metrics are direct short-term operational risk indicators from active workspace summaries.',
      },
      {
        question: 'Which projects are delayed?',
        answer: delayed.length > 0
          ? delayed.slice(0, 6).map((item) => `${item.label} (+${item.delayedDays}d)`).join(' | ')
          : 'No delayed project planning entry found.',
        confidence: delayed.length > 0 ? 92 : 78,
        source: 'ProjectExecutionWorkspaceService.getStore().planning',
        justification: 'Delayed days on planning entries are explicit schedule variance fields.',
      },
      {
        question: 'Which equipments are at risk?',
        answer: riskyEquipments.length > 0
          ? riskyEquipments.slice(0, 6).map((item) => `${item.code} (${item.healthScore})`).join(' | ')
          : 'No high-risk equipment detected by current health scores.',
        confidence: riskyEquipments.length > 0 ? 89 : 74,
        source: 'MaintenanceWorkspaceService.getStore().equipments',
        justification: 'Health score and failure status are leading indicators of breakdown risk.',
      },
      {
        question: 'Who are the top-performing suppliers?',
        answer: topSuppliers.length > 0
          ? topSuppliers.map((item) => `${item.name} (${item.automaticRating})`).join(' | ')
          : 'No supplier performance data available.',
        confidence: topSuppliers.length > 0 ? 84 : 62,
        source: 'ProcurementInventoryWorkspaceService.getStore().suppliers',
        justification: 'Automatic rating and on-time metrics provide comparative supplier performance ranking.',
      },
      {
        question: 'Which employees need training?',
        answer: lowEvaluation.length > 0
          ? lowEvaluation.slice(0, 6).map((item) => `${item.employeeId} (score ${item.score})`).join(' | ')
          : 'No employee under score threshold 3.5.',
        confidence: lowEvaluation.length > 0 ? 83 : 69,
        source: 'HumanResourcesWorkspaceService.getStore().evaluations',
        justification: 'Low performance scores are aligned with targeted upskilling recommendations.',
      },
      {
        question: 'Which workflows fail the most?',
        answer: failedWorkflows.length > 0
          ? Array.from(
            failedWorkflows.reduce((acc, item) => {
              acc.set(item.workflowName, (acc.get(item.workflowName) ?? 0) + 1)
              return acc
            }, new Map<string, number>()).entries(),
          )
            .sort((left, right) => right[1] - left[1])
            .slice(0, 6)
            .map(([name, count]) => `${name} (${count})`)
            .join(' | ')
          : 'No failing workflow found.',
        confidence: failedWorkflows.length > 0 ? 91 : 72,
        source: 'WorkflowWorkspaceService.listLogs()',
        justification: 'Execution logs expose objective failure frequency by workflow name.',
      },
    ]
  }

  static askDecisionAssistant(question: string): AssistantAnswer {
    const normalized = question.trim().toLowerCase()
    const answers = this.getAssistantAnswers()

    const matched = answers.find((item) => normalized && normalized.includes(item.question.toLowerCase().slice(0, 14)))
    if (matched) {
      return matched
    }

    const fallback = this.getTransverseAnalysis()
    return {
      question,
      answer: `Key alerts: ${fallback.alerts.slice(0, 3).join(' | ') || 'none'}; top opportunities: ${fallback.opportunities.slice(0, 2).join(' | ')}`,
      confidence: 68,
      source: 'EnterpriseInsightsWorkspaceService transverse analysis',
      justification: 'Fallback response synthesizes current high-priority alerts and opportunities.',
    }
  }

  static getExecutiveDashboard() {
    const views = this.getInsightsViews()
    const recommendations = this.buildRecommendations()
    const analysis = this.getTransverseAnalysis()

    const topKpis = [
      { label: 'Revenue', value: views.finance.revenue },
      { label: 'Cash flow', value: views.finance.cashFlow },
      { label: 'Project delays', value: views.projects.delays },
      { label: 'Open risks', value: views.executive.openRisks },
      { label: 'Workflow success', value: `${views.workflows.summary.successRate}%` },
      { label: 'AI success', value: views.ai.successRate },
    ]

    const topRisks = [
      `Delayed projects: ${views.projects.delays}`,
      `Maintenance failures: ${views.maintenance.failures}`,
      `Low stock items: ${views.procurement.lowStock}`,
      `Workflow failures: ${views.workflows.summary.failed}`,
      `Budget variance: ${views.finance.budgetVariance.toFixed(2)}`,
    ]

    const topOpportunities = analysis.opportunities

    const topRecommendations = recommendations.slice(0, 8)

    const timeline = [
      ...views.workflows.summary.timeline.slice(0, 4),
      ...views.documents.timeline.slice(0, 4).map((item) => `${item.type} • ${item.message}`),
    ].slice(0, 8)

    return {
      executiveSummary: {
        title: 'Enterprise decision posture',
        overview: `Revenue ${views.finance.revenue.toFixed(2)}, cash flow ${views.finance.cashFlow.toFixed(2)}, delays ${views.projects.delays}, workflow failures ${views.workflows.summary.failed}.`,
        confidence: Number((topRecommendations.reduce((sum, item) => sum + item.confidence, 0) / Math.max(1, topRecommendations.length)).toFixed(1)),
      },
      topKpis,
      topRisks,
      topOpportunities,
      topRecommendations,
      executiveTimeline: timeline,
      analysis,
    }
  }

  static refreshAndPersistInsights(): {
    recommendations: EnterpriseRecommendation[]
    events: InsightEvent[]
  } {
    const now = nowIso()
    const date = todayKey(now)
    const recommendations = this.buildRecommendations()

    const events: InsightEvent[] = recommendations.slice(0, 8).map((item) => ({
      id: id('evt'),
      type: item.priority === 'high' ? 'alert' : item.impact > 70 ? 'opportunity' : 'recommendation',
      view: item.view,
      title: item.title,
      detail: item.description,
      severity: item.priority,
      createdAt: now,
    }))

    const recommendationCount = recommendations.length
    const riskCount = recommendations.filter((item) => item.priority === 'high').length
    const opportunityCount = recommendations.filter((item) => item.impact >= 70).length
    const predictionCount = recommendations.filter((item) => item.confidence >= 85).length
    const avgConfidence = Number((recommendations.reduce((sum, item) => sum + item.confidence, 0) / Math.max(1, recommendations.length)).toFixed(1))

    const store = this.getStore()
    const metricsHistory = [
      { date, riskCount, opportunityCount, recommendationCount, predictionCount, avgConfidence },
      ...store.metricsHistory.filter((item) => item.date !== date),
    ].slice(0, 180)

    const recommendationHistory: DecisionHistoryItem[] = [
      ...recommendations.slice(0, 12).map((item) => ({
        id: id('rh'),
        type: 'recommendation' as const,
        title: item.title,
        detail: `${item.description} | priority ${item.priority} | confidence ${item.confidence}%`,
        source: item.source,
        createdAt: now,
      })),
      ...store.recommendationHistory,
    ].slice(0, 600)

    const decisionHistory: DecisionHistoryItem[] = [
      {
        id: id('dh'),
        type: 'decision' as const,
        title: 'Enterprise insights refresh',
        detail: `Refreshed with ${recommendationCount} recommendations and ${riskCount} high-priority alerts.`,
        source: 'EnterpriseInsightsWorkspaceService.refreshAndPersistInsights',
        createdAt: now,
      },
      ...store.decisionHistory,
    ].slice(0, 400)

    const comparisonHistory: DecisionHistoryItem[] = [
      {
        id: id('ch'),
        type: 'comparison' as const,
        title: 'Cross-domain comparison snapshot',
        detail: `Projects delays ${this.getInsightsViews().projects.delays} | procurement incidents ${this.getInsightsViews().procurement.incidents} | workflow failures ${this.getInsightsViews().workflows.summary.failed}.`,
        source: 'EnterpriseInsightsWorkspaceService.getTransverseAnalysis',
        createdAt: now,
      },
      ...store.comparisonHistory,
    ].slice(0, 400)

    const nextStore: EnterpriseInsightsStore = {
      decisionHistory,
      recommendationHistory,
      comparisonHistory,
      events: [...events, ...store.events].slice(0, 800),
      metricsHistory,
    }

    this.persist(nextStore)

    const topHighPriority = recommendations.filter((item) => item.priority === 'high').slice(0, 3)
    if (recommendationCount > 0) {
      notificationService.publish({
        title: 'New recommendation set',
        message: `${recommendationCount} recommendations generated for decision support.`,
        level: 'info',
        priority: 'medium',
        category: 'system',
        read: false,
        channels: ['email'],
      })
    }

    if (topHighPriority.length > 0) {
      notificationService.publish({
        title: 'New risk detected',
        message: topHighPriority[0].title,
        level: 'warning',
        priority: 'high',
        category: 'system',
        read: false,
        channels: ['email', 'whatsapp'],
      })
    }

    const topOpportunity = recommendations.find((item) => item.impact >= 70)
    if (topOpportunity) {
      notificationService.publish({
        title: 'New opportunity identified',
        message: topOpportunity.title,
        level: 'success',
        priority: 'medium',
        category: 'system',
        read: false,
        channels: ['email'],
      })
    }

    if (riskCount >= 3) {
      notificationService.publish({
        title: 'Critical alert',
        message: `High-priority alerts count reached ${riskCount}.`,
        level: 'error',
        priority: 'high',
        category: 'system',
        read: false,
        channels: ['email', 'whatsapp'],
      })
    }

    return { recommendations, events }
  }

  static getDecisionHistory(): DecisionHistoryItem[] {
    return this.getStore().decisionHistory
  }

  static getRecommendationsHistory(): DecisionHistoryItem[] {
    return this.getStore().recommendationHistory
  }

  static getComparisonsHistory(): DecisionHistoryItem[] {
    return this.getStore().comparisonHistory
  }

  static getObservability() {
    const store = this.getStore()
    const eventWindow = store.events.slice(0, 60)
    const highPriorityRecommendations = store.recommendationHistory.filter((item) => item.detail.includes('priority high')).length
    const avgConfidence = store.metricsHistory.length > 0
      ? Number((store.metricsHistory.reduce((sum, item) => sum + item.avgConfidence, 0) / store.metricsHistory.length).toFixed(1))
      : 0

    return {
      decisionEvents: eventWindow,
      insightMetrics: {
        refreshes: store.decisionHistory.length,
        events: store.events.length,
        highPriorityRecommendations,
      },
      recommendationMetrics: {
        totalRecommendations: store.recommendationHistory.length,
        avgConfidence,
      },
      predictionMetrics: {
        totalPredictions: store.metricsHistory.reduce((sum, item) => sum + item.predictionCount, 0),
        avgPredictionsPerDay: store.metricsHistory.length > 0
          ? Number((store.metricsHistory.reduce((sum, item) => sum + item.predictionCount, 0) / store.metricsHistory.length).toFixed(2))
          : 0,
      },
      diagnosticTimeline: store.metricsHistory.slice(0, 30),
    }
  }

  static exportDecisionHistory(): void {
    WorkspaceExchangeService.downloadJson('srg-enterprise-insights-decision-history.json', this.getDecisionHistory())
  }

  static exportRecommendationsHistory(): void {
    WorkspaceExchangeService.downloadJson('srg-enterprise-insights-recommendations-history.json', this.getRecommendationsHistory())
  }

  static exportComparisonsHistory(): void {
    WorkspaceExchangeService.downloadJson('srg-enterprise-insights-comparisons-history.json', this.getComparisonsHistory())
  }

  static getSearchFavorites(): string[] {
    return WorkspacePreferencesService.getPreferences().favorites['enterprise-insights-search'] ?? []
  }

  static setSearchFavorites(values: string[]): void {
    WorkspacePreferencesService.setFavorites('enterprise-insights-search', values)
  }
}
