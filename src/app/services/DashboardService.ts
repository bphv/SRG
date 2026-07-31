export type OverviewData = {
  userName: string
  date: string
  time: string
  activeProvider: string
  theme: 'light' | 'dark' | 'system'
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
    }
  }

  static getMetrics(): KpiData {
    return {
      projects: 12,
      generations: 348,
      prompts: 1248,
      providers: 4,
      averageGenerationTime: '3.1s',
      successRate: '97.8%',
    }
  }

  static getRecentActivity(): ActivityItem[] {
    return [
      {
        id: 'activity-1',
        time: '09:24',
        icon: '✨',
        title: 'Nouvelle génération',
        description: 'Génération de résumé terminée avec succès.',
        status: 'success',
      },
      {
        id: 'activity-2',
        time: '08:50',
        icon: '🧠',
        title: 'Prompt mis à jour',
        description: 'Prompt “Brainstorm idée produit” enregistré.',
        status: 'info',
      },
      {
        id: 'activity-3',
        time: '08:12',
        icon: '🗂️',
        title: 'Projet créé',
        description: 'Projet “SRG Website Launch” initialisé.',
        status: 'success',
      },
      {
        id: 'activity-4',
        time: '07:58',
        icon: '⚠️',
        title: 'Erreur de génération',
        description: 'Réponse timeout sur la génération de prompt.',
        status: 'error',
      },
    ]
  }

  static getHealth(): HealthItem[] {
    return [
      {
        id: 'health-openai',
        title: 'OpenAI',
        status: 'online',
        description: 'Provider actif et répondant.',
      },
      {
        id: 'health-pipeline',
        title: 'Pipeline',
        status: 'online',
        description: 'Orchestration stable.',
      },
      {
        id: 'health-transport',
        title: 'Transport',
        status: 'online',
        description: 'Couche réseau opérationnelle.',
      },
      {
        id: 'health-observability',
        title: 'Observability',
        status: 'online',
        description: 'Collecte métriques active.',
      },
      {
        id: 'health-runtime',
        title: 'Runtime Metrics',
        status: 'online',
        description: 'Statistiques de performance disponibles.',
      },
      {
        id: 'health-trace',
        title: 'Trace Manager',
        status: 'warning',
        description: 'Traces en cours de consolidation.',
      },
    ]
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
    return {
      overview: DashboardService.getOverview(),
      kpis: DashboardService.getMetrics(),
      recentActivity: DashboardService.getRecentActivity(),
      health: DashboardService.getHealth(),
      systemResources: DashboardService.getSystemResources(),
    }
  }
}
