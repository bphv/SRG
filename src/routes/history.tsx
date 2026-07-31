import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export const Route = createFileRoute('/history')({
  component: HistoryPage,
})

function HistoryPage() {
  const navigate = useNavigate()
  const [records, setRecords] = useState(() => HistoryWorkspaceService.getRecords())
  const [dateFilter, setDateFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
  const [providerFilter, setProviderFilter] = useState('all')
  const [modelFilter, setModelFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all')
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([])

  const projects = useMemo(
    () => ['all', ...Array.from(new Set(records.map((item) => item.projectName).filter((item): item is string => Boolean(item))))],
    [records],
  )
  const providers = useMemo(
    () => ['all', ...Array.from(new Set(records.map((item) => item.provider)))],
    [records],
  )
  const models = useMemo(
    () => ['all', ...Array.from(new Set(records.map((item) => item.model)))],
    [records],
  )

  const filteredRecords = useMemo(
    () =>
      records.filter((item) => {
        if (dateFilter && !item.createdAt.startsWith(dateFilter)) {
          return false
        }
        if (projectFilter !== 'all' && item.projectName !== projectFilter) {
          return false
        }
        if (providerFilter !== 'all' && item.provider !== providerFilter) {
          return false
        }
        if (modelFilter !== 'all' && item.model !== modelFilter) {
          return false
        }
        if (statusFilter !== 'all' && item.status !== statusFilter) {
          return false
        }
        return true
      }),
    [records, dateFilter, modelFilter, projectFilter, providerFilter, statusFilter],
  )

  const comparedRecords = filteredRecords.filter((item) => selectedCompareIds.includes(item.id)).slice(0, 2)

  const refresh = () => {
    setRecords(HistoryWorkspaceService.getRecords())
  }

  const deleteRecord = (id: string) => {
    HistoryWorkspaceService.deleteRecord(id)
    setSelectedCompareIds((current) => current.filter((item) => item !== id))
    refresh()
  }

  const rerunRecord = (id: string) => {
    const record = records.find((item) => item.id === id)
    if (!record) {
      return
    }

    HistoryWorkspaceService.setPendingRerun({
      promptName: record.promptName,
      promptText: record.promptText,
      provider: record.provider,
      model: record.model,
      projectId: record.projectId,
      projectName: record.projectName,
    })
    void navigate({ to: '/generate' })
  }

  const exportFiltered = () => {
    WorkspaceExchangeService.downloadJson('srg-history-export.json', filteredRecords)
  }

  const toggleCompare = (id: string, checked: boolean) => {
    setSelectedCompareIds((current) => {
      if (checked) {
        return [...current.filter((item) => item !== id), id].slice(-2)
      }
      return current.filter((item) => item !== id)
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="History" description="Filtrez, comparez, exportez et relancez vos executions SRG." />

      <Section title="Filtres" description="Date, projet, provider, modele et statut.">
        <div className="grid gap-3 md:grid-cols-5">
          <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm" />
          <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm">
            {projects.map((project) => <option key={project} value={project}>{project}</option>)}
          </select>
          <select value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm">
            {providers.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
          </select>
          <select value={modelFilter} onChange={(event) => setModelFilter(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm">
            {models.map((model) => <option key={model} value={model}>{model}</option>)}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | 'pending' | 'completed' | 'failed')} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm">
            <option value="all">all</option>
            <option value="pending">pending</option>
            <option value="completed">completed</option>
            <option value="failed">failed</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={exportFiltered} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Exporter JSON</button>
          <button type="button" onClick={() => { HistoryWorkspaceService.clear(); refresh() }} className="rounded-3xl border border-[rgba(223,78,78,0.24)] bg-[rgba(223,78,78,0.08)] px-4 py-2 text-sm font-semibold text-[#9b2f2f]">Vider</button>
        </div>
      </Section>

      <Section title="Executions" description="Historique complet des runs visibles.">
        <div className="space-y-3 text-sm">
          {filteredRecords.length === 0 ? (
            <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 text-[var(--sea-ink-soft)]">
              Aucun resultat pour les filtres courants.
            </div>
          ) : null}
          {filteredRecords.map((item) => (
            <article key={item.id} className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--sea-ink)]">{item.promptName}</p>
                  <p className="mt-1 text-[var(--sea-ink-soft)]">{item.projectName ?? 'No project'} • {item.provider} / {item.model}</p>
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-[var(--sea-ink-soft)]">
                  <input type="checkbox" checked={selectedCompareIds.includes(item.id)} onChange={(event) => toggleCompare(item.id, event.target.checked)} />
                  <span>Comparer</span>
                </label>
              </div>
              <p className="mt-3 text-[var(--sea-ink-soft)]">Statut: {item.status} • {new Date(item.createdAt).toLocaleString()} • {item.durationMs} ms • ${item.costEstimate.toFixed(6)}</p>
              <p className="mt-2 line-clamp-3 text-[var(--sea-ink-soft)]">{item.output || item.promptText}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => rerunRecord(item.id)} className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-xs font-semibold text-white">Relancer</button>
                <button type="button" onClick={() => WorkspaceExchangeService.downloadJson(`${item.id}.json`, item)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[var(--sea-ink)]">Exporter</button>
                <button type="button" onClick={() => deleteRecord(item.id)} className="rounded-3xl border border-[rgba(223,78,78,0.24)] bg-[rgba(223,78,78,0.08)] px-4 py-2 text-xs font-semibold text-[#9b2f2f]">Supprimer</button>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {comparedRecords.length === 2 ? (
        <Section title="Comparaison" description="Comparaison de deux runs selectionnes.">
          <div className="grid gap-4 xl:grid-cols-2">
            {comparedRecords.map((item) => (
              <div key={item.id} className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
                <p className="font-semibold text-[var(--sea-ink)]">{item.promptName}</p>
                <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">{item.provider} / {item.model} • {new Date(item.createdAt).toLocaleString()}</p>
                <pre className="mt-4 whitespace-pre-wrap break-words rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-xs text-[var(--sea-ink)]">{item.output || item.promptText}</pre>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  )
}
