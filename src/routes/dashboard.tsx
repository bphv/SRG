import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import NotificationCenter from '#/app/components/NotificationCenter'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import SmartInputBar from '#/app/components/SmartInputBar'
import DataTable from '#/app/components/ui/DataTable'
import type { DataTableColumn } from '#/app/components/ui/DataTable'
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
        description="Cockpit enterprise pilote par Ask SRG pour prioriser, surveiller et orchestrer les operations."
      />

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
            <article key={item.label} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{item.value}</p>
              <p className="text-sm text-[var(--srg-text-muted)]">Variation: {item.trend}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Executive Alerts" description="Alertes critiques, importantes, notifications et actions recommandees.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-[rgba(223,78,78,0.28)] bg-[rgba(223,78,78,0.08)] p-4 text-sm">
            <p className="font-semibold text-[var(--srg-text-title)]">Alertes critiques</p>
            {ALERTS.critical.map((item) => <p key={item} className="mt-2 text-[var(--srg-text-muted)]">{item}</p>)}
          </div>
          <div className="rounded-3xl border border-[rgba(197,145,31,0.28)] bg-[rgba(197,145,31,0.08)] p-4 text-sm">
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
            <div key={item} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-[var(--srg-text-muted)]">
              {item}
            </div>
          ))}
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
    </div>
  )
}