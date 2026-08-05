import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import NotificationCenter from '#/app/components/NotificationCenter'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import SmartInputBar from '#/app/components/SmartInputBar'
import DataTable from '#/app/components/ui/DataTable'
import type { DataTableColumn } from '#/app/components/ui/DataTable'
import Button from '#/app/components/ui/Button'
import { useAskSrgRuntimeContext } from '#/app/contexts/AskSrgRuntimeContext'
import { useTenantContext } from '#/app/contexts/TenantContext'
import { useNotifications } from '#/app/hooks/useNotifications'
import { notificationService } from '#/app/services/NotificationService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

type TimelineRow = {
  period: string
  focus: string
  owner: string
  status: string
}

type ActivityRow = {
  when: string
  actor: string
  action: string
  workspace: string
  details: string
}

type DocumentRow = {
  category: string
  name: string
  updatedAt: string
  owner: string
  status: string
}

const EXECUTIVE_KPIS = [
  { label: 'Revenus', value: '2.4M EUR', trend: '+4.8%' },
  { label: 'Depenses', value: '1.7M EUR', trend: '+2.1%' },
  { label: 'Tresorerie', value: '860K EUR', trend: '+1.2%' },
  { label: 'Achats', value: '420K EUR', trend: '-0.9%' },
  { label: 'Maintenance', value: '97 ordres', trend: '+3.4%' },
  { label: 'RH', value: '318 collaborateurs', trend: '+0.6%' },
  { label: 'Qualite', value: '12 non-conformites', trend: '-11.0%' },
  { label: 'Projets', value: '26 actifs', trend: '+5.0%' },
  { label: 'CRM', value: '148 interactions', trend: '+8.3%' },
]

const ALERTS = {
  critical: [
    'Tresorerie projet Atlas en seuil prudentiel sous 7 jours.',
    '2 equipements critiques sans validation finale de maintenance.',
  ],
  important: [
    'Retard fournisseur sur lot electrique lot B2.',
    'Mise a jour documentaire qualite attendue avant vendredi.',
  ],
  notifications: [
    'Revision budget mensuelle prete pour validation.',
    'Synthese RH hebdomadaire disponible.',
  ],
  actions: [
    'Prioriser la revue du planning maintenance zone Nord.',
    'Arbitrer les achats CAPEX du prochain sprint.',
  ],
}

const TIMELINE_ROWS: TimelineRow[] = [
  { period: "Aujourd'hui", focus: 'Revue cash + incidents prioritaires', owner: 'CFO / COO', status: 'En preparation' },
  { period: 'Cette semaine', focus: 'Arbitrage CAPEX, staffing, fournisseurs', owner: 'Comite executive', status: 'A confirmer' },
  { period: 'Ce mois', focus: 'Performance globale et trajectoire budgetaire', owner: 'Direction generale', status: 'Planifie' },
]

const WORKSPACE_LINKS = [
  { label: 'Finance', to: '/finance', description: 'Comptabilite, budgets, tresorerie' },
  { label: 'Maintenance', to: '/maintenance', description: 'Interventions, actifs, disponibilite' },
  { label: 'RH', to: '/human-resources', description: 'Effectifs, paie, absences' },
  { label: 'Qualite', to: '/reviews', description: 'Audits et controles qualite' },
  { label: 'Achats', to: '/procurement-inventory', description: 'Fournisseurs, commandes, stock' },
  { label: 'CRM', to: '/chat', description: 'Conversations et suivi client' },
  { label: 'Knowledge', to: '/knowledge-intelligence', description: 'Raisonnement documentaire' },
  { label: 'Workflow', to: '/workflow-automation', description: 'Automatisation transverse' },
  { label: 'Administration', to: '/administration', description: 'Configuration et gouvernance' },
]

const RECOMMENDATIONS = [
  'Consolider les depenses maintenance et achats sur un meme horizon 14 jours.',
  'Programmer une revue conjointe RH + Projets sur les ressources critiques.',
  'Renforcer les controles qualite des livrables fournisseurs prioritaires.',
]

const EXECUTIVE_DOCUMENTS: DocumentRow[] = [
  { category: 'Documents recents', name: 'Rapport hebdo exploitation', updatedAt: '2026-08-03 08:15', owner: 'Operations', status: 'Pret' },
  { category: 'Documents favoris', name: 'Politique achats groupe', updatedAt: '2026-08-02 17:40', owner: 'Procurement', status: 'Pret' },
  { category: 'Archives', name: 'Archive Q2 pilotage', updatedAt: '2026-07-29 11:02', owner: 'PMO', status: 'Pret' },
  { category: 'Contrats', name: 'Contrat maintenance Atlas', updatedAt: '2026-07-27 15:26', owner: 'Legal', status: 'A verifier' },
  { category: 'Factures', name: 'Factures fournisseurs semaine 31', updatedAt: '2026-08-01 09:44', owner: 'Finance', status: 'En attente' },
  { category: 'Rapports', name: 'Synthese executive mensuelle', updatedAt: '2026-07-31 18:20', owner: 'Direction', status: 'Pret' },
]

const ACTIVITY_ROWS: ActivityRow[] = [
  { when: '10:42', actor: 'Enterprise user placeholder', action: 'Consultation KPI', workspace: 'Dashboard', details: 'Revenus et depenses affiches' },
  { when: '10:18', actor: 'Enterprise user placeholder', action: 'Recherche', workspace: 'Knowledge Intelligence', details: 'Question sur contrats fournisseurs' },
  { when: '09:51', actor: 'Enterprise user placeholder', action: 'Export', workspace: 'Finance', details: 'Export de synthese budgetaire' },
  { when: '09:20', actor: 'Enterprise user placeholder', action: 'Validation', workspace: 'Workflow Automation', details: 'Workflow achats pre-valide' },
]

const CHARTS_PLACEHOLDER = [
  { title: 'Revenue vs Expenses', detail: 'Placeholder chart area - 12 mois' },
  { title: 'Operational Throughput', detail: 'Placeholder chart area - semaines' },
  { title: 'Quality Trend', detail: 'Placeholder chart area - anomalies et conformite' },
]

const LATEST_DECISIONS = [
  'Valider l acceleration du plan maintenance zone Nord.',
  'Prioriser la revue cash des projets a marge reduite.',
  'Replanifier les dependances fournisseurs critiques.',
]

const QUICK_ACTIONS = [
  { label: 'Open Enterprise Insights', to: '/enterprise-insights' },
  { label: 'Open Strategic Advisor', to: '/strategic-advisor' },
  { label: 'Open Observability', to: '/observability' },
  { label: 'Open History', to: '/history' },
]

const TODAY_PRIORITIES = [
  'Valider la revue de tresorerie projets critiques',
  'Arbitrer la priorite maintenance zone Nord',
  'Synchroniser achats et capacite fournisseurs',
]

function DashboardPage() {
  const tenant = useTenantContext()
  const askSrgRuntime = useAskSrgRuntimeContext()
  const notifications = useNotifications()

  const [localTime, setLocalTime] = useState('')
  const [smartInput, setSmartInput] = useState('')
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false)
  const [calendarScope, setCalendarScope] = useState<'today' | 'week' | 'upcoming'>(() => {
    const filters = WorkspacePreferencesService.getPreferences().filters['dashboard-exec'] ?? {}
    return filters.calendarScope === 'today' || filters.calendarScope === 'week' || filters.calendarScope === 'upcoming'
      ? filters.calendarScope
      : 'today'
  })

  useEffect(() => {
    const updateClock = () => {
      try {
        setLocalTime(new Date().toLocaleString('fr-FR', { timeZone: tenant.timezone }))
      } catch {
        setLocalTime(new Date().toLocaleString('fr-FR'))
      }
    }

    updateClock()
    const timer = window.setInterval(updateClock, 1000)
    return () => window.clearInterval(timer)
  }, [tenant.timezone])

  useEffect(() => {
    WorkspacePreferencesService.setFilters('dashboard-exec', { calendarScope })
  }, [calendarScope])

  const unreadNotifications = notifications.notifications.filter((item) => !item.read).length

  const runtimeStatus = useMemo(() => {
    if (askSrgRuntime.session.voiceEnabled) return 'Pret (voix active)'
    return 'Pret (placeholder)'
  }, [askSrgRuntime.session.voiceEnabled])

  const timelineColumns: Array<DataTableColumn<TimelineRow>> = [
    { key: 'period', label: 'Periode', sortable: true },
    { key: 'focus', label: 'Focus' },
    { key: 'owner', label: 'Owner', sortable: true },
    { key: 'status', label: 'Statut', sortable: true },
  ]

  const documentColumns: Array<DataTableColumn<DocumentRow>> = [
    { key: 'category', label: 'Categorie', sortable: true },
    { key: 'name', label: 'Document', sortable: true },
    { key: 'updatedAt', label: 'Mise a jour', sortable: true },
    { key: 'owner', label: 'Owner', sortable: true },
    { key: 'status', label: 'Statut', sortable: true },
  ]

  const activityColumns: Array<DataTableColumn<ActivityRow>> = [
    { key: 'when', label: 'Heure', sortable: true },
    { key: 'actor', label: 'Utilisateur', sortable: true },
    { key: 'action', label: 'Action', sortable: true },
    { key: 'workspace', label: 'Workspace', sortable: true },
    { key: 'details', label: 'Details' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Command Center"
        description="SRG Enterprise Intelligence Platform - executive cockpit for enterprise orchestration."
      />

      <section className="srg-hero-banner srg-scale-in p-6 sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[color-mix(in_oklab,var(--srg-white)_70%,var(--srg-azure))]">Executive Welcome</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Bienvenue {tenant.activeUser}, pilotage global de {tenant.activeEnterprise}</h2>
            <p className="mt-3 max-w-2xl text-sm text-[color-mix(in_oklab,var(--srg-white)_85%,var(--srg-azure))]">
              SRG centralise vos priorites, vos risques et vos decisions critiques dans une experience executive unifiee.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="srg-badge srg-badge-premium">Enterprise Premium</span>
              <span className="srg-badge srg-badge-ready">Realtime Ready</span>
              <span className="srg-badge srg-badge-ai">Ask SRG Ready</span>
            </div>
          </div>
          <div className="rounded-3xl border border-white/20 bg-white/10 p-4 text-sm backdrop-blur-sm">
            <p className="font-semibold">Intelligent Summary</p>
            <p className="mt-2 text-[color-mix(in_oklab,var(--srg-white)_88%,var(--srg-azure))]">
              Performance stable, vigilance sur tresorerie projet Atlas, opportunite d'optimisation immediate sur la chaine achats-maintenance.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/20 bg-black/10 p-3">
                <p className="text-xs uppercase tracking-[0.18em]">Important Notifications</p>
                <p className="mt-1 text-xl font-semibold">{unreadNotifications}</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-black/10 p-3">
                <p className="text-xs uppercase tracking-[0.18em]">Local Time</p>
                <p className="mt-1 text-sm font-semibold">{localTime || 'Synchronisation...'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section title="Ask SRG Widget" description="Premium visual conversation widget placeholder.">
        <div className="srg-ask-panel">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--srg-color-primary-500)] text-white">SRG</span>
              <div>
                <p className="font-semibold text-[var(--srg-text-title)]">Ask SRG Conversation</p>
                <p className="text-xs text-[var(--srg-text-muted)]">Assistant enterprise premium</p>
              </div>
            </div>
            <span className="srg-badge srg-badge-ai">AI</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="srg-chat-bubble srg-chat-bubble-assistant">
              Bonjour. Je prepare votre synthese executive. Quels indicateurs voulez-vous prioriser ?
              <div className="mt-2 inline-flex items-center gap-1" aria-label="Animation de reflexion">
                <span className="srg-thinking-dot" />
                <span className="srg-thinking-dot" />
                <span className="srg-thinking-dot" />
              </div>
            </div>
            <div className="srg-chat-bubble srg-chat-bubble-user">
              Afficher les alertes critiques, les decisions recentes et un plan d'action 7 jours.
            </div>
            <div className="srg-chat-bubble srg-chat-bubble-assistant">
              Compris. Je compile les risques majeurs et les recommandations transverses.
              <span className="srg-typing-caret" aria-hidden> </span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="srg-badge srg-badge-ready">Confiance: 92%</span>
            <span className="srg-badge srg-badge-enterprise">Sources: Dashboard + Knowledge + Workflow</span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--srg-text-muted)]">Suggestions</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {RECOMMENDATIONS.map((item) => <span key={item} className="srg-smart-chip">{item}</span>)}
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--srg-text-muted)]">Documents recents</p>
              <div className="mt-2 space-y-1 text-xs text-[var(--srg-text-muted)]">
                {EXECUTIVE_DOCUMENTS.slice(0, 3).map((doc) => <p key={doc.name}>• {doc.name}</p>)}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Button variant="secondary" size="sm"><span aria-hidden>🎤</span><span>Micro</span></Button>
            <Button variant="secondary" size="sm"><span aria-hidden>📷</span><span>Camera</span></Button>
            <Button variant="secondary" size="sm"><span aria-hidden>📎</span><span>Documents</span></Button>
            <Button variant="secondary" size="sm"><span aria-hidden>🕘</span><span>Historique</span></Button>
            <Button variant="secondary" size="sm"><span aria-hidden>★</span><span>Favoris</span></Button>
            <Button variant="secondary" size="sm"><span aria-hidden>↗</span><span>Partager</span></Button>
            <Button variant="secondary" size="sm"><span aria-hidden>⇩</span><span>Exporter</span></Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((item) => (
              <Link key={item.to} to={item.to} className="srg-smart-chip no-underline">{item.label}</Link>
            ))}
          </div>
          <div className="mt-4">
            <SmartInputBar
              value={smartInput}
              onValueChange={setSmartInput}
              onSubmit={(value) => {
                setSmartInput(value)
              }}
              placeholder="Demander une synthese, une analyse ou une recommandation"
              persistKey="dashboard-ask-srg-widget"
              mode="conversation"
              submitLabel="Envoyer"
              showDropzone={false}
            />
          </div>
        </div>
      </Section>

      <Section title="Executive Header" description="Entreprise active, tenant, utilisateur, horodatage local et statuts runtime.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Entreprise active</p>
            <p className="mt-2 text-lg font-semibold text-[var(--srg-text-title)]">{tenant.activeEnterprise}</p>
            <p className="text-sm text-[var(--srg-text-muted)]">Tenant: {tenant.tenantId}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Utilisateur connecte</p>
            <p className="mt-2 text-lg font-semibold text-[var(--srg-text-title)]">{tenant.activeUser}</p>
            <p className="text-sm text-[var(--srg-text-muted)]">Workspace: {tenant.workspaceName}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Heure locale</p>
            <p className="mt-2 text-lg font-semibold text-[var(--srg-text-title)]" aria-live="polite">{localTime || 'Synchronisation...'}</p>
            <p className="text-sm text-[var(--srg-text-muted)]">Fuseau: {tenant.timezone}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-sm">
            <p className="font-semibold text-[var(--srg-text-title)]">Statut systeme</p>
            <p className="mt-1 text-[var(--srg-text-muted)]">Prepared - shell, contexts et services UI disponibles.</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-sm">
            <p className="font-semibold text-[var(--srg-text-title)]">Statut Ask SRG</p>
            <p className="mt-1 text-[var(--srg-text-muted)]">{runtimeStatus}</p>
          </div>
        </div>
      </Section>

      <Section title="SmartInputBar" description="Point d'entree unique texte, micro, camera, upload et glisser-deposer.">
        <SmartInputBar
          value={smartInput}
          onValueChange={setSmartInput}
          onSubmit={(value) => {
            setSmartInput(value)
            const prompt = value.trim() || 'Action executive sans texte'
            notifications.publish({
              title: 'Demande Executive enregistree',
              message: `Placeholder Ask SRG: ${prompt}`,
              level: 'info',
              priority: 'medium',
              category: 'system',
              read: false,
              channels: ['email'],
            })
            notificationService.publish({
              title: 'SmartInputBar active',
              message: 'Interaction executive enregistree (placeholder).',
              level: 'info',
              priority: 'low',
              category: 'system',
              read: false,
              channels: ['email'],
            })
          }}
          placeholder="Posez une consigne executive (placeholder)"
          persistKey="dashboard-executive-smart-input"
          mode="conversation"
          submitLabel="Executer"
          ariaLabel="Executive Smart Input"
          enableNotifications
          showDropzone
        />
      </Section>

      <Section title="Executive KPIs" description="Indicateurs executives placeholders avant integration des donnees reelles.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {EXECUTIVE_KPIS.map((item) => (
            <article key={item.label} className="srg-kpi-premium srg-slide-up">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{item.value}</p>
              <p className="text-sm text-[var(--srg-text-muted)]">Variation: {item.trend}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Today's Priorities" description="Priorites critiques des 24 prochaines heures.">
        <div className="grid gap-4 lg:grid-cols-3">
          {TODAY_PRIORITIES.map((item) => (
            <article key={item} className="srg-premium-card rounded-3xl p-4">
              <p className="srg-label">Priority</p>
              <p className="mt-2 text-sm text-[var(--srg-text-body)]">{item}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Charts Placeholders" description="Visual placeholders for executive trend analysis.">
        <div className="grid gap-4 lg:grid-cols-3">
          {CHARTS_PLACEHOLDER.map((item) => (
            <article key={item.title} className="srg-premium-card rounded-3xl p-4">
              <p className="font-semibold text-[var(--srg-text-title)]">{item.title}</p>
              <p className="mt-1 text-sm text-[var(--srg-text-muted)]">{item.detail}</p>
              <div className="srg-skeleton mt-4 h-40 rounded-2xl" aria-hidden="true" />
            </article>
          ))}
        </div>
      </Section>

      <Section title="Executive Alerts" description="Alertes critiques, importantes, notifications et actions recommandees.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-[color-mix(in_oklab,var(--danger)_32%,var(--srg-border))] bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] p-4 text-sm">
            <p className="font-semibold text-[var(--srg-text-title)]">Alertes critiques</p>
            {ALERTS.critical.map((item) => <p key={item} className="mt-2 text-[var(--srg-text-muted)]">{item}</p>)}
          </div>
          <div className="rounded-3xl border border-[color-mix(in_oklab,var(--warning)_36%,var(--srg-border))] bg-[color-mix(in_oklab,var(--warning)_14%,transparent)] p-4 text-sm">
            <p className="font-semibold text-[var(--srg-text-title)]">Alertes importantes</p>
            {ALERTS.important.map((item) => <p key={item} className="mt-2 text-[var(--srg-text-muted)]">{item}</p>)}
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-sm">
            <p className="font-semibold text-[var(--srg-text-title)]">Notifications</p>
            <p className="mt-2 text-[var(--srg-text-muted)]">Non lues: {unreadNotifications}</p>
            {ALERTS.notifications.map((item) => <p key={item} className="mt-2 text-[var(--srg-text-muted)]">{item}</p>)}
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-sm">
            <p className="font-semibold text-[var(--srg-text-title)]">Actions recommandees</p>
            {ALERTS.actions.map((item) => <p key={item} className="mt-2 text-[var(--srg-text-muted)]">{item}</p>)}
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setIsNotificationCenterOpen((value) => !value)}
            className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--srg-color-primary-500)]"
            aria-expanded={isNotificationCenterOpen}
            aria-controls="dashboard-notification-center"
          >
            {isNotificationCenterOpen ? 'Masquer Notification Center' : 'Afficher Notification Center'}
          </button>
        </div>
        {isNotificationCenterOpen ? (
          <div id="dashboard-notification-center" className="mt-4">
            <NotificationCenter
              notifications={notifications.notifications}
              onClose={() => setIsNotificationCenterOpen(false)}
              onDismiss={notifications.dismiss}
              onClear={notifications.clear}
              onMarkRead={notifications.markRead}
              onMarkAllRead={notifications.markAllRead}
            />
          </div>
        ) : null}
      </Section>

      <Section title="Executive Timeline" description="Chronologie de pilotage: aujourd'hui, cette semaine, ce mois.">
        <DataTable
          tableId="dashboard-exec-timeline"
          title="Executive timeline"
          rows={TIMELINE_ROWS}
          columns={timelineColumns}
          pageSize={6}
          searchable={false}
          exportFileName="srg-dashboard-exec-timeline.csv"
        />
      </Section>

      <Section title="Executive Workspace" description="Acces rapide vers les workspaces enterprise existants.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {WORKSPACE_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 no-underline transition hover:border-[var(--srg-color-primary-400)] hover:bg-[var(--srg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--srg-color-primary-500)]"
              aria-label={`Ouvrir workspace ${item.label}`}
            >
              <p className="font-semibold text-[var(--srg-text-title)]">{item.label}</p>
              <p className="mt-1 text-sm text-[var(--srg-text-muted)]">{item.description}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Ask SRG vous recommande" description="Recommandations simulees sans IA reelle.">
        <div className="space-y-3 text-sm">
          {RECOMMENDATIONS.map((item) => (
            <div key={item} className="srg-premium-card rounded-3xl p-4 text-[var(--srg-text-muted)]">
              {item}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Executive Summary" description="Synthesis placeholders for leadership readout.">
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="srg-premium-card rounded-3xl p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Summary</p>
            <p className="mt-2 text-sm text-[var(--srg-text-muted)]">Performance globale en progression moderee. Risques principaux concentres sur achats et maintenance. Opportunites sur optimisation workflow et allocation RH.</p>
          </article>
          <article className="srg-premium-card rounded-3xl p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Latest Decisions</p>
            {LATEST_DECISIONS.map((item) => <p key={item} className="mt-2 text-sm text-[var(--srg-text-muted)]">{item}</p>)}
          </article>
        </div>
      </Section>

      <Section title="Executive Documents" description="Documents recents, favoris, archives, contrats, factures et rapports (placeholders).">
        <DataTable
          tableId="dashboard-exec-documents"
          title="Executive documents"
          rows={EXECUTIVE_DOCUMENTS}
          columns={documentColumns}
          pageSize={8}
          exportFileName="srg-dashboard-exec-documents.csv"
        />
      </Section>

      <Section title="Executive Calendar" description="Vue aujourd'hui, cette semaine et prochaines echeances.">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Calendar scope">
          <button
            type="button"
            onClick={() => setCalendarScope('today')}
            className={`rounded-3xl border px-4 py-2 text-sm font-semibold ${calendarScope === 'today' ? 'border-[var(--srg-color-primary-400)] bg-[var(--srg-hover)] text-[var(--srg-text-title)]' : 'border-[var(--srg-border)] bg-[var(--srg-surface-strong)] text-[var(--srg-text-muted)]'}`}
            aria-selected={calendarScope === 'today'}
          >
            Aujourd'hui
          </button>
          <button
            type="button"
            onClick={() => setCalendarScope('week')}
            className={`rounded-3xl border px-4 py-2 text-sm font-semibold ${calendarScope === 'week' ? 'border-[var(--srg-color-primary-400)] bg-[var(--srg-hover)] text-[var(--srg-text-title)]' : 'border-[var(--srg-border)] bg-[var(--srg-surface-strong)] text-[var(--srg-text-muted)]'}`}
            aria-selected={calendarScope === 'week'}
          >
            Cette semaine
          </button>
          <button
            type="button"
            onClick={() => setCalendarScope('upcoming')}
            className={`rounded-3xl border px-4 py-2 text-sm font-semibold ${calendarScope === 'upcoming' ? 'border-[var(--srg-color-primary-400)] bg-[var(--srg-hover)] text-[var(--srg-text-title)]' : 'border-[var(--srg-border)] bg-[var(--srg-surface-strong)] text-[var(--srg-text-muted)]'}`}
            aria-selected={calendarScope === 'upcoming'}
          >
            Prochaines echeances
          </button>
        </div>
        <div className="mt-4 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-sm text-[var(--srg-text-muted)]">
          {calendarScope === 'today' ? 'Revue des alertes critiques, arbitrage depenses et suivi interventions prioritaires.' : null}
          {calendarScope === 'week' ? 'Comite hebdomadaire: finance, achats, qualite, RH et trajectoire projets.' : null}
          {calendarScope === 'upcoming' ? 'Echeances a venir: cloture mensuelle, contractualisation fournisseurs, audit qualite.' : null}
        </div>
      </Section>

      <Section title="Executive Activity" description="Historique utilisateur, actions, recherches et exports recents.">
        <DataTable
          tableId="dashboard-exec-activity"
          title="Executive activity"
          rows={ACTIVITY_ROWS}
          columns={activityColumns}
          pageSize={8}
          exportFileName="srg-dashboard-exec-activity.csv"
        />
      </Section>

      <Section title="Workspace Status" description="Readiness placeholders for enterprise workspaces.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {['Finance', 'Maintenance', 'RH', 'Knowledge', 'Workflow', 'CRM', 'Administration', 'Observability'].map((item) => (
            <article key={item} className="srg-premium-card rounded-3xl p-4">
              <p className="font-semibold text-[var(--srg-text-title)]">{item}</p>
              <p className="mt-1 text-xs text-[var(--srg-text-muted)]">Prepared</p>
              <span className="srg-badge srg-badge-ready mt-2">Ready</span>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Enterprise Health" description="Enterprise-level health placeholders.">
        <div className="grid gap-4 lg:grid-cols-3">
          <article className="srg-premium-card rounded-3xl p-4"><p className="srg-label">Governance</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">Stable</p></article>
          <article className="srg-premium-card rounded-3xl p-4"><p className="srg-label">Risk Exposure</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">Moderate</p></article>
          <article className="srg-premium-card rounded-3xl p-4"><p className="srg-label">Execution Confidence</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">81%</p></article>
        </div>
      </Section>

      <Section title="System Health" description="System-level placeholders for runtime and reliability.">
        <div className="grid gap-4 lg:grid-cols-3">
          <article className="srg-premium-card rounded-3xl p-4"><p className="srg-label">Availability</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">99.9%</p></article>
          <article className="srg-premium-card rounded-3xl p-4"><p className="srg-label">Latency</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">320ms</p></article>
          <article className="srg-premium-card rounded-3xl p-4"><p className="srg-label">Incidents</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">2 open</p></article>
        </div>
      </Section>

      <Section title="Quick Actions" description="Fast executive navigation shortcuts.">
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((item) => (
            <Link key={item.to} to={item.to} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] no-underline hover:bg-[var(--srg-hover)]">
              {item.label}
            </Link>
          ))}
        </div>
      </Section>

    </div>
  )
}