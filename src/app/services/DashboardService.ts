import { ProjectService } from '#/app/services/ProjectService'
import { PromptService } from '#/app/services/PromptService'
import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { ProviderWorkspaceService } from '#/app/services/ProviderWorkspaceService'
import { notificationService } from '#/app/services/NotificationService'

export type OverviewData = {
  userName: string
  date: string
  time: string
  activeProvider: string
  theme: 'light' | 'dark' | 'system'
  workspaceGreeting: string
}

export type KpiData = {
  projects: number
  generations: number
  prompts: number
  providers: number
  averageGenerationTime: string
  successRate: string
}

export type ActivityItem = {
  id: string
  time: string
  icon: string
  title: string
  description: string
  status: 'success' | 'warning' | 'error' | 'info'
}

export type HealthItem = {
  id: string
  title: string
  status: 'online' | 'offline' | 'warning' | 'unknown'
  description: string
}

export type SystemResource = {
  id: string
  label: string
  value: string
  progress: number
}

export type DashboardState = {
  overview: OverviewData
  kpis: KpiData
  recentActivity: ActivityItem[]
  health: HealthItem[]
  systemResources: SystemResource[]
  accountSummary: Array<{ label: string; value: string }>
  walletSummary: Array<{ label: string; value: string; helper: string }>
  latestRuns: Array<{ id: string; title: string; meta: string }>
  latestProjects: Array<{ id: string; title: string; meta: string }>
  latestPrompts: Array<{ id: string; title: string; meta: string }>
  notifications: Array<{ id: string; title: string; meta: string }>
  aiConsumption: Array<{ label: string; value: number; helper: string }>
  activityChart: Array<{ label: string; value: number; helper: string }>
}

export class DashboardService {
  static getOverview(): OverviewData {
    const now = new Date()

    return {
      userName: 'Alex',
      date: now.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
      time: now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      activeProvider: 'OpenAI',
      theme: 'system',
      workspaceGreeting: 'Voici votre espace SRG du jour.',
    }
  }

  static getMetrics(): KpiData {
    const projects = ProjectService.getProjects()
    const prompts = PromptService.getPrompts()
    const history = HistoryWorkspaceService.getRecords()
    const providers = ProviderWorkspaceService.list().filter((item) => item.status === 'enabled')
    const averageLatency = history.length > 0
      ? `${(history.reduce((sum, item) => sum + item.durationMs, 0) / history.length / 1000).toFixed(1)}s`
      : '0.0s'
    const successRate = history.length > 0
      ? `${((history.filter((item) => item.status === 'completed').length / history.length) * 100).toFixed(1)}%`
      : '100%'

    return {
      projects: projects.length,
      generations: history.length,
      prompts: prompts.length,
      providers: providers.length,
      averageGenerationTime: averageLatency,
      successRate,
    }
  }

  static getRecentActivity(): ActivityItem[] {
    const history = HistoryWorkspaceService.getRecords().slice(0, 4)
    if (history.length === 0) {
      return []
    }

    return history.map((item) => ({
      id: item.id,
      time: new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      icon: item.status === 'completed' ? '✨' : item.status === 'failed' ? '⚠️' : '⏳',
      title: item.promptName,
      description: `${item.provider} / ${item.model} • ${item.durationMs} ms`,
      status: item.status === 'completed' ? 'success' : item.status === 'failed' ? 'error' : 'info',
    }))
  }

  static getHealth(): HealthItem[] {
    return ProviderWorkspaceService.list().map((item) => ({
      id: `health-${item.id}`,
      title: item.label,
      status: item.health === 'healthy' ? 'online' : item.health === 'degraded' ? 'warning' : 'offline',
      description: `${item.status} • ${item.latencyMs} ms • ${item.availability}`,
    }))
  }

  static getSystemResources(): SystemResource[] {
    return [
      {
        id: 'resource-memory',
        label: 'Utilisation mémoire',
        value: '68%',
        progress: 68,
      },
      {
        id: 'resource-uptime',
        label: 'Temps de fonctionnement',
        value: '14h 24m',
        progress: 90,
      },
      {
        id: 'resource-requests',
        label: 'Nombre de requêtes',
        value: '4 102',
        progress: 75,
      },
      {
        id: 'resource-errors',
        label: 'Nombre d’erreurs',
        value: '12',
        progress: 25,
      },
      {
        id: 'resource-latency',
        label: 'Latence moyenne',
        value: '320 ms',
        progress: 56,
      },
    ]
  }

  static getDashboardState(): DashboardState {
    const projects = ProjectService.getProjects()
    const prompts = PromptService.getPrompts()
    const history = HistoryWorkspaceService.getRecords()
    const notifications = notificationService.list().slice(0, 4)

    return {
      overview: DashboardService.getOverview(),
      kpis: DashboardService.getMetrics(),
      recentActivity: DashboardService.getRecentActivity(),
      health: DashboardService.getHealth(),
      systemResources: DashboardService.getSystemResources(),
      accountSummary: [
        { label: 'Projets favoris', value: `${projects.filter((item) => item.favorite).length}` },
        { label: 'Prompts publies', value: `${prompts.filter((item) => item.status === 'active').length}` },
        { label: 'Runs reussis', value: `${history.filter((item) => item.status === 'completed').length}` },
        { label: 'Notifications non lues', value: `${notifications.filter((item) => !item.read).length}` },
      ],
      walletSummary: [
        {
          label: 'Wallet',
          value: `$${history.reduce((sum, item) => sum + item.costEstimate, 0).toFixed(4)}`,
          helper: 'Consommation cumulée visible dans History',
        },
        {
          label: 'Credits',
          value: `${Math.max(0, 10000 - history.reduce((sum, item) => sum + item.tokensInput + item.tokensOutput, 0))}`,
          helper: 'Budget local restant estimé en tokens',
        },
      ],
      latestRuns: history.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.promptName,
        meta: `${item.provider} / ${item.model} • ${item.durationMs} ms`,
      })),
      latestProjects: projects.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.name,
        meta: `${item.provider} • ${item.promptCount} prompts • ${item.generationCount} generations`,
      })),
      latestPrompts: prompts.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.name,
        meta: `${item.provider} • ${item.model} • ${item.runCount} runs`,
      })),
      notifications: notifications.map((item) => ({
        id: item.id,
        title: item.title,
        meta: `${item.category} • ${new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
      })),
      aiConsumption: [
        {
          label: 'Tokens input',
          value: history.reduce((sum, item) => sum + item.tokensInput, 0),
          helper: 'Consommation texte entrante',
        },
        {
          label: 'Tokens output',
          value: history.reduce((sum, item) => sum + item.tokensOutput, 0),
          helper: 'Consommation texte sortante',
        },
        {
          label: 'Cout estime x1M',
          value: Math.round(history.reduce((sum, item) => sum + item.costEstimate, 0) * 1000000),
          helper: 'Projection cout local',
        },
      ],
      activityChart: history.slice(0, 7).reverse().map((item, index) => ({
        label: `Run ${index + 1}`,
        value: item.tokensInput + item.tokensOutput,
        helper: `${item.provider} • ${item.durationMs} ms`,
      })),
    }
  }
}
