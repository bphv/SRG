import { notificationService } from '#/app/services/NotificationService'
import { EnterpriseInsightsWorkspaceService } from '#/app/services/EnterpriseInsightsWorkspaceService'
import type { EnterpriseRecommendation, RecommendationPriority } from '#/app/services/EnterpriseInsightsWorkspaceService'
import { KnowledgeIntelligenceWorkspaceService } from '#/app/services/KnowledgeIntelligenceWorkspaceService'
import { WorkflowWorkspaceService } from '#/app/services/WorkflowWorkspaceService'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'
import { FinanceWorkspaceService } from '#/app/services/FinanceWorkspaceService'
import { ProcurementInventoryWorkspaceService } from '#/app/services/ProcurementInventoryWorkspaceService'
import { HumanResourcesWorkspaceService } from '#/app/services/HumanResourcesWorkspaceService'
import { MaintenanceWorkspaceService } from '#/app/services/MaintenanceWorkspaceService'
import { ConversationWorkspaceService } from '#/app/services/ConversationWorkspaceService'
import { KnowledgeWorkspaceService } from '#/app/services/KnowledgeWorkspaceService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export type StrategicAdvisorView =
  | 'executive'
  | 'finance'
  | 'maintenance'
  | 'hr'
  | 'procurement'
  | 'crm'
  | 'projects'
  | 'knowledge'
  | 'workflow'

export type StrategicPlanType =
  | 'action-plan'
  | 'risk-reduction-plan'
  | 'maintenance-plan'
  | 'hr-plan'
  | 'budget-plan'
  | 'document-plan'
  | 'project-plan'
  | 'quality-plan'

export type StrategicActionBucket = 'immediate' | 'monitor' | 'plan' | 'postpone' | 'close'

export type StrategicDifficulty = 'low' | 'medium' | 'high'

export type StrategicActionPlan = {
  id: string
  type: StrategicPlanType
  view: StrategicAdvisorView
  objective: string
  priority: RecommendationPriority
  impactExpected: number
  urgency: number
  difficulty: StrategicDifficulty
  estimatedCost: number
  estimatedDurationDays: number
  impactedServices: string[]
  referenceDocuments: string[]
  justification: string
  createdAt: string
}

export type StrategicScenarioType = 'optimistic' | 'realistic' | 'prudent' | 'critical'

export type StrategicScenario = {
  id: string
  type: StrategicScenarioType
  advantages: string[]
  risks: string[]
  assumptions: string[]
  consequences: string[]
  confidence: number
  createdAt: string
}

export type StrategicActionComment = {
  id: string
  author: string
  message: string
  createdAt: string
}

export type StrategicActionTracking = {
  id: string
  status: 'created' | 'assigned' | 'in-progress' | 'blocked' | 'done'
  note: string
  createdAt: string
}

export type StrategicAction = {
  id: string
  title: string
  description: string
  view: StrategicAdvisorView
  bucket: StrategicActionBucket
  priority: RecommendationPriority
  impact: number
  urgency: number
  owner: string
  dueDate: string
  progress: number
  status: 'open' | 'in-progress' | 'done' | 'blocked'
  comments: StrategicActionComment[]
  tracking: StrategicActionTracking[]
  source: string
  createdAt: string
}

export type StrategicSimulationInput = {
  budgetIncreasePercent: number
  workforceReductionPercent: number
  supplierDelayDays: number
  maintenanceLoadIncreasePercent: number
  projectDelayDays: number
  newContractValue: number
}

export type StrategicSimulationResult = {
  id: string
  input: StrategicSimulationInput
  financialImpact: number
  riskImpact: number
  deliveryImpact: number
  workforceImpact: number
  maintenanceImpact: number
  confidence: number
  conclusions: string[]
  createdAt: string
}

export type StrategicDecisionRecord = {
  id: string
  title: string
  detail: string
  source: string
  createdAt: string
}

export type StrategicEvent = {
  id: string
  type: 'recommendation' | 'plan' | 'simulation' | 'risk' | 'action'
  severity: RecommendationPriority
  title: string
  detail: string
  createdAt: string
}

export type StrategicMetrics = {
  date: string
  recommendations: number
  plans: number
  simulations: number
  highRisks: number
  immediateActions: number
  avgConfidence: number
}

export type StrategicAdvisorStore = {
  decisions: StrategicDecisionRecord[]
  actionPlans: StrategicActionPlan[]
  simulationHistory: StrategicSimulationResult[]
  recommendationHistory: EnterpriseRecommendation[]
  actions: StrategicAction[]
  events: StrategicEvent[]
  metricsTimeline: StrategicMetrics[]
}

const STORAGE_KEY = 'srg.strategic.advisor.workspace.v1'
const FAVORITES_KEY = 'strategic-advisor-search'

function mapRecommendationView(view: EnterpriseRecommendation['view']): StrategicAdvisorView {
  if (view === 'workflows') return 'workflow'
  if (view === 'documents') return 'knowledge'
  if (view === 'ai') return 'executive'
  return view
}

function nowIso(): string {
  return new Date().toISOString()
}

function dayKey(value: string = nowIso()): string {
  return value.slice(0, 10)
}

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function defaultStore(): StrategicAdvisorStore {
  return {
    decisions: [],
    actionPlans: [],
    simulationHistory: [],
    recommendationHistory: [],
    actions: [],
    events: [],
    metricsTimeline: [],
  }
}

function priorityToScore(priority: RecommendationPriority): number {
  if (priority === 'high') return 3
  if (priority === 'medium') return 2
  return 1
}

function priorityFromNumeric(value: number): RecommendationPriority {
  if (value >= 75) return 'high'
  if (value >= 45) return 'medium'
  return 'low'
}

function difficultyFromNumeric(value: number): StrategicDifficulty {
  if (value >= 75) return 'high'
  if (value >= 40) return 'medium'
  return 'low'
}

export class StrategicAdvisorWorkspaceService {
  private static memoryStore: StrategicAdvisorStore = defaultStore()

  static getStore(): StrategicAdvisorStore {
    if (typeof window === 'undefined') {
      return this.memoryStore
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const seed = defaultStore()
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
        return seed
      }

      const parsed = JSON.parse(raw) as Partial<StrategicAdvisorStore>
      const seed = defaultStore()

      return {
        decisions: Array.isArray(parsed.decisions) ? parsed.decisions : seed.decisions,
        actionPlans: Array.isArray(parsed.actionPlans) ? parsed.actionPlans : seed.actionPlans,
        simulationHistory: Array.isArray(parsed.simulationHistory) ? parsed.simulationHistory : seed.simulationHistory,
        recommendationHistory: Array.isArray(parsed.recommendationHistory) ? parsed.recommendationHistory : seed.recommendationHistory,
        actions: Array.isArray(parsed.actions) ? parsed.actions : seed.actions,
        events: Array.isArray(parsed.events) ? parsed.events : seed.events,
        metricsTimeline: Array.isArray(parsed.metricsTimeline) ? parsed.metricsTimeline : seed.metricsTimeline,
      }
    } catch {
      return defaultStore()
    }
  }

  private static persist(store: StrategicAdvisorStore): void {
    this.memoryStore = store
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    }
  }

  static getSearchFavorites(): string[] {
    return WorkspacePreferencesService.getPreferences().favorites[FAVORITES_KEY] ?? []
  }

  static setSearchFavorites(favorites: string[]): void {
    WorkspacePreferencesService.setFavorites(FAVORITES_KEY, favorites.slice(0, 16))
  }

  static getStrategicViews() {
    const enterprise = EnterpriseInsightsWorkspaceService.getExecutiveDashboard()
    const knowledge = KnowledgeIntelligenceWorkspaceService.getDashboardSummary()
    const workflow = WorkflowWorkspaceService.getDashboardSummary()
    const finance = FinanceWorkspaceService.getSummary()
    const maintenance = MaintenanceWorkspaceService.getSummary()
    const hr = HumanResourcesWorkspaceService.getSummary()
    const procurement = ProcurementInventoryWorkspaceService.getSummary()
    const projects = ProjectExecutionWorkspaceService.getSummary()
    const crm = ConversationWorkspaceService.getGlobalSummary()
    const documents = KnowledgeWorkspaceService.getSummary()

    return {
      executive: {
        confidence: enterprise.executiveSummary.confidence,
        topRecommendations: enterprise.topRecommendations.length,
        topRisks: enterprise.topRisks.length,
        topOpportunities: enterprise.topOpportunities.length,
      },
      finance,
      maintenance,
      hr,
      procurement,
      crm,
      projects,
      knowledge,
      workflow,
      documents,
    }
  }

  static buildRecommendations(): EnterpriseRecommendation[] {
    const base = EnterpriseInsightsWorkspaceService.buildRecommendations()
    const knowledge = KnowledgeIntelligenceWorkspaceService.getDashboardSummary()
    const workflow = WorkflowWorkspaceService.getDashboardSummary()

    const additions: EnterpriseRecommendation[] = [
      {
        id: id('srec'),
        view: 'documents',
        title: 'Reduce critical knowledge exposure',
        description: `${knowledge.criticalDocuments} critical documents and ${knowledge.expiredDocuments} expired documents require remediation plans.`,
        priority: knowledge.criticalDocuments > 5 ? 'high' : knowledge.criticalDocuments > 0 ? 'medium' : 'low',
        impact: clamp(45 + knowledge.criticalDocuments * 8, 15, 100),
        urgency: clamp(40 + knowledge.expiredDocuments * 10, 10, 100),
        confidence: 84,
        source: 'KnowledgeIntelligenceWorkspaceService.getDashboardSummary()',
        justification: 'Knowledge quality and freshness directly affect strategy reliability and execution confidence.',
        createdAt: nowIso(),
      },
      {
        id: id('srec'),
        view: 'workflows',
        title: 'Accelerate workflow recovery cycle',
        description: `${workflow.failed} failed workflows and average duration ${workflow.avgDurationMs}ms indicate an automation stabilization opportunity.`,
        priority: workflow.failed > 2 ? 'high' : workflow.failed > 0 ? 'medium' : 'low',
        impact: clamp(35 + workflow.failed * 14, 10, 100),
        urgency: clamp(32 + workflow.failed * 15, 10, 100),
        confidence: 86,
        source: 'WorkflowWorkspaceService.getDashboardSummary()',
        justification: 'Workflow reliability has immediate effect on throughput, cost and delivery predictability.',
        createdAt: nowIso(),
      },
    ]

    return [...base, ...additions].sort((left, right) => {
      const priorityDelta = priorityToScore(right.priority) - priorityToScore(left.priority)
      if (priorityDelta !== 0) return priorityDelta
      return right.confidence - left.confidence
    })
  }

  static buildActionPlans(): StrategicActionPlan[] {
    const views = this.getStrategicViews()
    const recommendations = this.buildRecommendations()
    const topDocuments = KnowledgeWorkspaceService.getStore().documents.slice(0, 6).map((item) => item.title)

    const delayedProjects = views.projects.delays
    const highRisk = recommendations.filter((item) => item.priority === 'high').length

    const plans: StrategicActionPlan[] = [
      {
        id: id('plan'),
        type: 'action-plan',
        view: 'executive',
        objective: 'Align executive priorities with cross-domain execution constraints.',
        priority: highRisk > 2 ? 'high' : 'medium',
        impactExpected: clamp(60 + highRisk * 7, 20, 100),
        urgency: clamp(50 + delayedProjects * 6, 20, 100),
        difficulty: difficultyFromNumeric(65),
        estimatedCost: 22000,
        estimatedDurationDays: 21,
        impactedServices: ['Finance', 'Projects', 'Workflow', 'Maintenance'],
        referenceDocuments: topDocuments,
        justification: 'A single executive action plan reduces fragmented decisions and improves resource arbitration.',
        createdAt: nowIso(),
      },
      {
        id: id('plan'),
        type: 'risk-reduction-plan',
        view: 'projects',
        objective: 'Reduce project delay and high-risk operational incidents.',
        priority: views.projects.delays > 2 ? 'high' : 'medium',
        impactExpected: clamp(52 + views.projects.delays * 8, 20, 100),
        urgency: clamp(48 + views.projects.risks * 7, 20, 100),
        difficulty: difficultyFromNumeric(70),
        estimatedCost: 18000,
        estimatedDurationDays: 30,
        impactedServices: ['Projects', 'Procurement', 'Maintenance'],
        referenceDocuments: topDocuments,
        justification: 'Delays and risk accumulation have first-order impact on delivery reliability and margin.',
        createdAt: nowIso(),
      },
      {
        id: id('plan'),
        type: 'maintenance-plan',
        view: 'maintenance',
        objective: 'Lower failure rate and improve asset availability through preventive cycles.',
        priority: views.maintenance.failures > 0 ? 'high' : 'medium',
        impactExpected: clamp(44 + views.maintenance.failures * 10, 20, 100),
        urgency: clamp(40 + views.maintenance.failures * 12, 20, 100),
        difficulty: difficultyFromNumeric(62),
        estimatedCost: 26000,
        estimatedDurationDays: 45,
        impactedServices: ['Maintenance', 'Procurement', 'Projects'],
        referenceDocuments: topDocuments,
        justification: 'Preventive maintenance strategy lowers unplanned downtime and emergency spend.',
        createdAt: nowIso(),
      },
      {
        id: id('plan'),
        type: 'hr-plan',
        view: 'hr',
        objective: 'Stabilize workforce performance and close skill gaps in critical teams.',
        priority: views.hr.leavePending > 3 ? 'high' : 'medium',
        impactExpected: clamp(36 + views.hr.leavePending * 7, 18, 100),
        urgency: clamp(34 + views.hr.leavePending * 8, 18, 100),
        difficulty: difficultyFromNumeric(56),
        estimatedCost: 15000,
        estimatedDurationDays: 28,
        impactedServices: ['HR', 'Projects', 'Maintenance'],
        referenceDocuments: topDocuments,
        justification: 'Performance and availability drive execution pace across project and maintenance domains.',
        createdAt: nowIso(),
      },
      {
        id: id('plan'),
        type: 'budget-plan',
        view: 'finance',
        objective: 'Contain budget variance while protecting cash flow and strategic initiatives.',
        priority: views.finance.budgetVariance > 0 ? 'high' : 'medium',
        impactExpected: clamp(58 + Math.abs(views.finance.budgetVariance) * 0.2, 20, 100),
        urgency: clamp(50 + Math.abs(views.finance.budgetVariance) * 0.25, 20, 100),
        difficulty: difficultyFromNumeric(68),
        estimatedCost: 12000,
        estimatedDurationDays: 20,
        impactedServices: ['Finance', 'Procurement', 'Projects'],
        referenceDocuments: topDocuments,
        justification: 'Budget discipline and cash visibility are prerequisites for sustainable strategic execution.',
        createdAt: nowIso(),
      },
      {
        id: id('plan'),
        type: 'document-plan',
        view: 'knowledge',
        objective: 'Improve document quality, freshness and traceability for strategic decisions.',
        priority: views.knowledge.criticalDocuments > 0 ? 'high' : 'medium',
        impactExpected: clamp(40 + views.knowledge.criticalDocuments * 10, 20, 100),
        urgency: clamp(38 + views.knowledge.expiredDocuments * 11, 20, 100),
        difficulty: difficultyFromNumeric(52),
        estimatedCost: 9000,
        estimatedDurationDays: 18,
        impactedServices: ['Knowledge', 'Finance', 'Projects', 'Workflow'],
        referenceDocuments: topDocuments,
        justification: 'Decision accuracy depends on document confidence, versioning and content freshness.',
        createdAt: nowIso(),
      },
      {
        id: id('plan'),
        type: 'project-plan',
        view: 'projects',
        objective: 'Recover delayed milestones and enforce planning discipline.',
        priority: views.projects.delays > 0 ? 'high' : 'medium',
        impactExpected: clamp(46 + views.projects.delays * 11, 20, 100),
        urgency: clamp(44 + views.projects.delays * 13, 20, 100),
        difficulty: difficultyFromNumeric(74),
        estimatedCost: 19500,
        estimatedDurationDays: 35,
        impactedServices: ['Projects', 'Workflow', 'Procurement'],
        referenceDocuments: topDocuments,
        justification: 'Schedule recovery requires coordinated sequencing, ownership and supplier alignment.',
        createdAt: nowIso(),
      },
      {
        id: id('plan'),
        type: 'quality-plan',
        view: 'procurement',
        objective: 'Reduce non-conformities and enforce quality checks across delivery flows.',
        priority: views.procurement.openNonConformities > 0 ? 'high' : 'medium',
        impactExpected: clamp(42 + views.procurement.openNonConformities * 12, 20, 100),
        urgency: clamp(39 + views.procurement.openNonConformities * 13, 20, 100),
        difficulty: difficultyFromNumeric(58),
        estimatedCost: 11000,
        estimatedDurationDays: 24,
        impactedServices: ['Procurement', 'Projects', 'Maintenance'],
        referenceDocuments: topDocuments,
        justification: 'Supplier quality incidents propagate schedule and cost risk downstream.',
        createdAt: nowIso(),
      },
    ]

    return plans.sort((left, right) => {
      const priorityDelta = priorityToScore(right.priority) - priorityToScore(left.priority)
      if (priorityDelta !== 0) return priorityDelta
      return right.urgency - left.urgency
    })
  }

  static buildScenarios(): StrategicScenario[] {
    const views = this.getStrategicViews()
    const commonDate = nowIso()

    const optimistic: StrategicScenario = {
      id: id('scn'),
      type: 'optimistic',
      advantages: [
        'Supplier stability improves delivery predictability.',
        'Workflow automation failures are reduced quickly.',
        'Project delays are recovered without overtime overload.',
      ],
      risks: ['Complacency may delay preventive maintenance rigor.'],
      assumptions: [
        'On-time supplier performance remains above current baseline.',
        'No major provider degradation over planning horizon.',
      ],
      consequences: [
        'Margin and cash flow improve progressively.',
        'Strategic actions can shift from immediate to planned mode.',
      ],
      confidence: 78,
      createdAt: commonDate,
    }

    const realistic: StrategicScenario = {
      id: id('scn'),
      type: 'realistic',
      advantages: ['Current recommendation set delivers measurable reduction of top risks.'],
      risks: ['Some delayed milestones remain due to procurement lead times.'],
      assumptions: [
        'Budget variance is controlled but not fully neutralized.',
        'Maintenance failures trend down with preventive scheduling.',
      ],
      consequences: [
        'Execution remains stable with moderate risk pressure.',
        'Decision cadence needs weekly steering checkpoints.',
      ],
      confidence: 84,
      createdAt: commonDate,
    }

    const prudent: StrategicScenario = {
      id: id('scn'),
      type: 'prudent',
      advantages: ['Conservative budgeting protects cash flow under volatility.'],
      risks: ['Reduced investment slows delivery and innovation pace.'],
      assumptions: [
        'At least one supplier lane remains unstable.',
        'Workflow failure rate decreases slowly.',
      ],
      consequences: [
        'Priority focus shifts to critical-only initiatives.',
        'Some actions are postponed to preserve liquidity.',
      ],
      confidence: clamp(70 - views.procurement.incidents * 2, 45, 78),
      createdAt: commonDate,
    }

    const critical: StrategicScenario = {
      id: id('scn'),
      type: 'critical',
      advantages: ['Crisis governance improves visibility and accountability.'],
      risks: [
        'Compounded project delays and maintenance failures raise cost pressure.',
        'Repeated workflow disruptions degrade execution capacity.',
      ],
      assumptions: [
        'Supplier delays intensify and contingency inventory is limited.',
        'Budget variance worsens before mitigation takes effect.',
      ],
      consequences: [
        'Immediate actions dominate the strategic backlog.',
        'High-risk notifications increase in frequency.',
      ],
      confidence: clamp(62 - views.workflow.failed, 35, 68),
      createdAt: commonDate,
    }

    return [optimistic, realistic, prudent, critical]
  }

  private static seedActions(plans: StrategicActionPlan[], recommendations: EnterpriseRecommendation[]): StrategicAction[] {
    const topPlans = plans.slice(0, 8)
    const topRecommendations = recommendations.slice(0, 8)

    const planActions: StrategicAction[] = topPlans.map((plan) => {
      const bucket: StrategicActionBucket = plan.priority === 'high'
        ? 'immediate'
        : plan.urgency > 65
          ? 'monitor'
          : 'plan'

      return {
        id: id('act'),
        title: plan.objective,
        description: `${plan.type} | ${plan.justification}`,
        view: plan.view,
        bucket,
        priority: plan.priority,
        impact: plan.impactExpected,
        urgency: plan.urgency,
        owner: 'Unassigned',
        dueDate: new Date(Date.now() + plan.estimatedDurationDays * 24 * 60 * 60 * 1000).toISOString(),
        progress: 0,
        status: 'open',
        comments: [],
        tracking: [{ id: id('trk'), status: 'created' as const, note: 'Action created from strategic plan.', createdAt: nowIso() }],
        source: 'StrategicAdvisorWorkspaceService.buildActionPlans()',
        createdAt: nowIso(),
      }
    })

    const recommendationActions: StrategicAction[] = topRecommendations.map((recommendation) => {
      const bucket: StrategicActionBucket = recommendation.priority === 'high'
        ? 'immediate'
        : recommendation.urgency > 70
          ? 'monitor'
          : recommendation.urgency > 45
            ? 'plan'
            : 'postpone'

      return {
      id: id('act'),
      title: recommendation.title,
      description: recommendation.description,
      view: recommendation.view === 'workflows'
        ? 'workflow'
        : mapRecommendationView(recommendation.view),
      bucket,
      priority: recommendation.priority,
      impact: recommendation.impact,
      urgency: recommendation.urgency,
      owner: 'Unassigned',
      dueDate: new Date(Date.now() + Math.max(3, Math.round(45 - recommendation.urgency / 2)) * 24 * 60 * 60 * 1000).toISOString(),
      progress: 0,
      status: 'open',
      comments: [],
      tracking: [{ id: id('trk'), status: 'created' as const, note: 'Action generated from recommendation.', createdAt: nowIso() }],
      source: recommendation.source,
      createdAt: nowIso(),
      }
    })

    return [...planActions, ...recommendationActions].slice(0, 24)
  }

  static listActions(): StrategicAction[] {
    const store = this.getStore()
    if (store.actions.length > 0) {
      return store.actions
    }

    const seeded = this.seedActions(this.buildActionPlans(), this.buildRecommendations())
    this.persist({ ...store, actions: seeded })
    return seeded
  }

  static assignAction(actionId: string, owner: string): StrategicAction | undefined {
    const store = this.getStore()
    const trimmed = owner.trim()
    if (!trimmed) return undefined

    const action = store.actions.find((item) => item.id === actionId)
    if (!action) return undefined

    const updated: StrategicAction = {
      ...action,
      owner: trimmed,
      status: action.status === 'open' ? 'in-progress' : action.status,
      tracking: [
        {
          id: id('trk'),
          status: 'assigned',
          note: `Assigned to ${trimmed}.`,
          createdAt: nowIso(),
        },
        ...action.tracking,
      ],
    }

    const nextActions = store.actions.map((item) => (item.id === updated.id ? updated : item))
    this.persist({ ...store, actions: nextActions })
    return updated
  }

  static commentAction(actionId: string, author: string, message: string): StrategicAction | undefined {
    const store = this.getStore()
    const normalizedAuthor = author.trim() || 'System'
    const text = message.trim()
    if (!text) return undefined

    const action = store.actions.find((item) => item.id === actionId)
    if (!action) return undefined

    const updated: StrategicAction = {
      ...action,
      comments: [
        {
          id: id('com'),
          author: normalizedAuthor,
          message: text,
          createdAt: nowIso(),
        },
        ...action.comments,
      ],
      tracking: [
        {
          id: id('trk'),
          status: 'in-progress',
          note: `Comment added by ${normalizedAuthor}.`,
          createdAt: nowIso(),
        },
        ...action.tracking,
      ],
    }

    const nextActions = store.actions.map((item) => (item.id === updated.id ? updated : item))
    this.persist({ ...store, actions: nextActions })
    return updated
  }

  static moveActionBucket(actionId: string, bucket: StrategicActionBucket): StrategicAction | undefined {
    const store = this.getStore()
    const action = store.actions.find((item) => item.id === actionId)
    if (!action) return undefined

    const status = bucket === 'close' ? 'done' : action.status
    const progress = bucket === 'close' ? 100 : action.progress

    const updated: StrategicAction = {
      ...action,
      bucket,
      status,
      progress,
      tracking: [
        {
          id: id('trk'),
          status: bucket === 'close' ? 'done' : 'in-progress',
          note: `Action moved to ${bucket}.`,
          createdAt: nowIso(),
        },
        ...action.tracking,
      ],
    }

    this.persist({
      ...store,
      actions: store.actions.map((item) => (item.id === updated.id ? updated : item)),
    })

    return updated
  }

  static runWhatIfSimulation(input: StrategicSimulationInput): StrategicSimulationResult {
    const views = this.getStrategicViews()

    const budgetSignal = input.budgetIncreasePercent * 0.7 + input.newContractValue / 20000
    const workforceSignal = input.workforceReductionPercent * 1.3
    const delaySignal = input.supplierDelayDays * 1.1 + input.projectDelayDays * 1.25
    const maintenanceSignal = input.maintenanceLoadIncreasePercent * 1.2

    const financialImpact = Number((views.finance.cashFlow + budgetSignal * 1200 - workforceSignal * 800 - delaySignal * 350).toFixed(2))
    const riskImpact = clamp(
      views.projects.risks + views.procurement.incidents + views.maintenance.failures + Math.round(delaySignal * 0.4) + Math.round(workforceSignal * 0.25),
      0,
      999,
    )
    const deliveryImpact = clamp(views.projects.delays + Math.round(delaySignal * 0.5) - Math.round(input.budgetIncreasePercent * 0.08), 0, 999)
    const workforceImpact = clamp(views.hr.employees - Math.round(views.hr.employees * (input.workforceReductionPercent / 100)), 0, views.hr.employees)
    const maintenanceImpact = clamp(views.maintenance.failures + Math.round(maintenanceSignal * 0.2) - Math.round(input.budgetIncreasePercent * 0.1), 0, 999)

    const confidence = clamp(
      84
      - Math.round(input.workforceReductionPercent * 0.4)
      - Math.round(input.supplierDelayDays * 0.35)
      - Math.round(input.projectDelayDays * 0.35)
      + Math.round(input.budgetIncreasePercent * 0.18),
      35,
      96,
    )

    const conclusions = [
      `Financial impact projection: ${financialImpact.toFixed(2)}.`,
      `Risk pressure projection: ${riskImpact}.`,
      `Delivery delay projection: ${deliveryImpact}.`,
      `Workforce capacity projection: ${workforceImpact}.`,
      `Maintenance pressure projection: ${maintenanceImpact}.`,
    ]

    const simulation: StrategicSimulationResult = {
      id: id('sim'),
      input,
      financialImpact,
      riskImpact,
      deliveryImpact,
      workforceImpact,
      maintenanceImpact,
      confidence,
      conclusions,
      createdAt: nowIso(),
    }

    const store = this.getStore()
    const event: StrategicEvent = {
      id: id('evt'),
      type: 'simulation',
      severity: priorityFromNumeric(riskImpact > 12 ? 85 : riskImpact > 7 ? 65 : 35),
      title: 'What-if simulation executed',
      detail: `Risk ${riskImpact} | Delivery ${deliveryImpact} | Confidence ${confidence}%`,
      createdAt: simulation.createdAt,
    }

    this.persist({
      ...store,
      simulationHistory: [simulation, ...store.simulationHistory].slice(0, 400),
      events: [event, ...store.events].slice(0, 1200),
    })

    notificationService.publish({
      title: 'Nouvelle simulation',
      message: `Simulation What-if executee (confiance ${confidence}%).`,
      level: 'info',
      priority: 'medium',
      category: 'system',
      read: false,
      channels: ['email'],
    })

    if (riskImpact >= 10) {
      notificationService.publish({
        title: 'Risque critique',
        message: `La simulation indique un niveau de risque eleve (${riskImpact}).`,
        level: 'error',
        priority: 'high',
        category: 'system',
        read: false,
        channels: ['email', 'whatsapp'],
      })
    }

    return simulation
  }

  static getExecutiveDashboard() {
    const recommendations = this.buildRecommendations()
    const plans = this.buildActionPlans()
    const scenarios = this.buildScenarios()
    const actions = this.listActions()
    const store = this.getStore()

    const topPriorities = plans.slice(0, 5).map((item) => item.objective)
    const topDecisions = store.decisions.slice(0, 5).map((item) => item.title)
    const strategicTimeline = [
      ...store.events.slice(0, 8).map((item) => `${item.type} | ${item.title}`),
      ...EnterpriseInsightsWorkspaceService.getExecutiveDashboard().executiveTimeline.slice(0, 4),
    ].slice(0, 12)

    const criticalScenario = scenarios.find((item) => item.type === 'critical')

    const strategicRisks = [
      ...criticalScenario?.risks ?? [],
      ...recommendations.filter((item) => item.priority === 'high').slice(0, 3).map((item) => item.title),
    ].slice(0, 10)

    const strategicOpportunities = [
      ...EnterpriseInsightsWorkspaceService.getExecutiveDashboard().topOpportunities.slice(0, 5),
      ...recommendations.filter((item) => item.impact >= 75).slice(0, 5).map((item) => item.title),
    ].slice(0, 10)

    const strategicActions = actions
      .filter((item) => item.bucket === 'immediate' || item.bucket === 'monitor')
      .sort((left, right) => right.urgency - left.urgency)
      .slice(0, 12)

    const avgConfidence = Number((recommendations.reduce((sum, item) => sum + item.confidence, 0) / Math.max(1, recommendations.length)).toFixed(1))

    return {
      topPriorities,
      topDecisions,
      strategicTimeline,
      strategicRisks,
      strategicOpportunities,
      strategicActions,
      confidence: avgConfidence,
      plansCount: plans.length,
      recommendationsCount: recommendations.length,
      simulationsCount: store.simulationHistory.length,
    }
  }

  static refreshAndPersistAdvisor(): {
    plans: StrategicActionPlan[]
    recommendations: EnterpriseRecommendation[]
    actions: StrategicAction[]
  } {
    const now = nowIso()
    const date = dayKey(now)

    const plans = this.buildActionPlans()
    const recommendations = this.buildRecommendations()
    const scenarios = this.buildScenarios()

    const store = this.getStore()
    const actions = store.actions.length > 0 ? store.actions : this.seedActions(plans, recommendations)

    const decision: StrategicDecisionRecord = {
      id: id('dec'),
      title: 'Strategic advisor refresh',
      detail: `${plans.length} plans, ${recommendations.length} recommendations, ${actions.length} actions and ${scenarios.length} scenarios refreshed.`,
      source: 'StrategicAdvisorWorkspaceService.refreshAndPersistAdvisor()',
      createdAt: now,
    }

    const events: StrategicEvent[] = [
      {
        id: id('evt'),
        type: 'plan',
        severity: plans.some((item) => item.priority === 'high') ? 'high' : 'medium',
        title: 'Nouveau plan',
        detail: `${plans.length} plans d'action strategiques disponibles.`,
        createdAt: now,
      },
      {
        id: id('evt'),
        type: 'recommendation',
        severity: recommendations.some((item) => item.priority === 'high') ? 'high' : 'medium',
        title: 'Nouvelle recommandation',
        detail: `${recommendations.length} recommandations priorisees generees.`,
        createdAt: now,
      },
      {
        id: id('evt'),
        type: 'action',
        severity: actions.filter((item) => item.bucket === 'immediate').length > 0 ? 'high' : 'medium',
        title: 'Action prioritaire',
        detail: `${actions.filter((item) => item.bucket === 'immediate').length} action(s) a traiter immediatement.`,
        createdAt: now,
      },
      {
        id: id('evt'),
        type: 'risk',
        severity: recommendations.filter((item) => item.priority === 'high').length >= 3 ? 'high' : 'medium',
        title: 'Risque critique',
        detail: `${recommendations.filter((item) => item.priority === 'high').length} recommandations haute priorite detectees.`,
        createdAt: now,
      },
    ]

    const avgConfidence = Number((recommendations.reduce((sum, item) => sum + item.confidence, 0) / Math.max(1, recommendations.length)).toFixed(1))
    const metrics: StrategicMetrics = {
      date,
      recommendations: recommendations.length,
      plans: plans.length,
      simulations: store.simulationHistory.length,
      highRisks: recommendations.filter((item) => item.priority === 'high').length,
      immediateActions: actions.filter((item) => item.bucket === 'immediate').length,
      avgConfidence,
    }

    this.persist({
      decisions: [decision, ...store.decisions].slice(0, 500),
      actionPlans: [...plans, ...store.actionPlans].slice(0, 800),
      simulationHistory: store.simulationHistory,
      recommendationHistory: [...recommendations, ...store.recommendationHistory].slice(0, 800),
      actions,
      events: [...events, ...store.events].slice(0, 1200),
      metricsTimeline: [metrics, ...store.metricsTimeline.filter((item) => item.date !== date)].slice(0, 365),
    })

    notificationService.publish({
      title: 'Nouvelle recommandation',
      message: `${recommendations.length} recommandations stratégiques mises a jour.`,
      level: 'info',
      priority: 'medium',
      category: 'system',
      read: false,
      channels: ['email'],
    })

    notificationService.publish({
      title: 'Nouveau plan',
      message: `${plans.length} plans d'action strategiques generes.`,
      level: 'success',
      priority: 'medium',
      category: 'system',
      read: false,
      channels: ['email'],
    })

    if (recommendations.filter((item) => item.priority === 'high').length >= 3) {
      notificationService.publish({
        title: 'Risque critique',
        message: 'Le conseiller strategique detecte plusieurs priorites critiques.',
        level: 'error',
        priority: 'high',
        category: 'system',
        read: false,
        channels: ['email', 'whatsapp'],
      })
    }

    if (actions.filter((item) => item.bucket === 'immediate').length > 0) {
      notificationService.publish({
        title: 'Action prioritaire',
        message: `${actions.filter((item) => item.bucket === 'immediate').length} action(s) immediate(s) a executer.`,
        level: 'warning',
        priority: 'high',
        category: 'system',
        read: false,
        channels: ['email', 'whatsapp'],
      })
    }

    return { plans, recommendations, actions }
  }

  static getStrategicDecisions(): StrategicDecisionRecord[] {
    return this.getStore().decisions
  }

  static getActionPlansHistory(): StrategicActionPlan[] {
    return this.getStore().actionPlans
  }

  static getSimulationHistory(): StrategicSimulationResult[] {
    return this.getStore().simulationHistory
  }

  static getRecommendationsHistory(): EnterpriseRecommendation[] {
    return this.getStore().recommendationHistory
  }

  static getObservability() {
    const store = this.getStore()
    const latestMetric = store.metricsTimeline.at(0)

    return {
      strategicEvents: store.events.slice(0, 120),
      simulationMetrics: {
        total: store.simulationHistory.length,
        avgConfidence: store.simulationHistory.length > 0
          ? Number((store.simulationHistory.reduce((sum, item) => sum + item.confidence, 0) / store.simulationHistory.length).toFixed(1))
          : 0,
        latestFinancialImpact: store.simulationHistory[0]?.financialImpact ?? 0,
      },
      decisionMetrics: {
        decisions: store.decisions.length,
        plans: store.actionPlans.length,
        recommendations: store.recommendationHistory.length,
        highRisks: latestMetric?.highRisks ?? 0,
      },
      advisorTimeline: store.metricsTimeline.slice(0, 90),
    }
  }

  static exportStrategicDecisions(): void {
    WorkspaceExchangeService.downloadJson('srg-strategic-decisions.json', this.getStrategicDecisions())
  }

  static exportActionPlans(): void {
    WorkspaceExchangeService.downloadJson('srg-strategic-action-plans.json', this.getActionPlansHistory())
  }

  static exportSimulationHistory(): void {
    WorkspaceExchangeService.downloadJson('srg-strategic-simulation-history.json', this.getSimulationHistory())
  }

  static exportRecommendationsHistory(): void {
    WorkspaceExchangeService.downloadJson('srg-strategic-recommendations-history.json', this.getRecommendationsHistory())
  }

  static exportActions(): void {
    WorkspaceExchangeService.downloadJson('srg-strategic-actions.json', this.listActions())
  }
}
