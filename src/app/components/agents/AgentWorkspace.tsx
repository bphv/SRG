import { useMemo, useState } from 'react'
import EmptyState from '#/app/components/EmptyState'
import Section from '#/app/components/Section'
import { useBusiness } from '#/app/hooks/useBusiness'
import { useAgentWorkspace } from '#/app/hooks/useAgentWorkspace'
import { AgentWorkspaceService } from '#/app/services/AgentWorkspaceService'
import type { AgentAutomation, AgentMemoryEntry, AgentRecord, AgentToolBinding, AgentVariable, AgentWorkflow } from '#/app/services/AgentWorkspaceService'

function sparkline(values: number[]): string {
  const blocks = ['_', '.', '-', '=', '*', '#']
  const max = Math.max(1, ...values)
  return values.slice(0, 16).map((value) => blocks[Math.min(blocks.length - 1, Math.floor((value / max) * (blocks.length - 1)))]).join('')
}

function findAgentById(agents: AgentRecord[], agentId: string | null): AgentRecord | undefined {
  if (!agentId) return undefined
  return agents.find((item) => item.id === agentId)
}

function EditorPane({
  agent,
  workflows,
  automations,
  actorName,
  refresh,
}: {
  agent: AgentRecord
  workflows: AgentWorkflow[]
  automations: AgentAutomation[]
  actorName: string
  refresh: () => void
}) {
  const [tagInput, setTagInput] = useState('')
  const [varName, setVarName] = useState('')
  const [varValue, setVarValue] = useState('')
  const [memoryTitle, setMemoryTitle] = useState('')
  const [memoryContent, setMemoryContent] = useState('')
  const [comment, setComment] = useState('')
  const [workflowName, setWorkflowName] = useState('')
  const [automationName, setAutomationName] = useState('')

  const updateBuilder = <TKey extends keyof AgentRecord['builder']>(key: TKey, value: AgentRecord['builder'][TKey]) => {
    AgentWorkspaceService.updateAgent(agent.id, (item) => ({
      ...item,
      builder: {
        ...item.builder,
        [key]: value,
      },
    }))
    refresh()
  }

  const addVariable = () => {
    const trimmed = varName.trim()
    if (!trimmed) return
    const next: AgentVariable[] = [...agent.variables, { id: `var-${Date.now()}`, name: trimmed, value: varValue, required: true }]
    AgentWorkspaceService.setVariables(agent.id, next)
    setVarName('')
    setVarValue('')
    refresh()
  }

  const addMemory = (kind: AgentMemoryEntry['kind']) => {
    if (!memoryTitle.trim() || !memoryContent.trim()) return
    const next: AgentMemoryEntry[] = [
      {
        id: `mem-${Date.now()}`,
        kind,
        title: memoryTitle.trim(),
        content: memoryContent.trim(),
        sourceType: 'manual',
        createdAt: new Date().toISOString(),
      },
      ...agent.memories,
    ]
    AgentWorkspaceService.setMemories(agent.id, next)
    setMemoryTitle('')
    setMemoryContent('')
    refresh()
  }

  const toggleTool = (toolId: AgentToolBinding['id']) => {
    const next = agent.tools.map((item) => (item.id === toolId ? { ...item, enabled: !item.enabled } : item))
    AgentWorkspaceService.setTools(agent.id, next)
    refresh()
  }

  return (
    <div className="space-y-4">
      <Section title="Agent Builder" description="Build no-code agent behavior and runtime policy.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <input aria-label="Agent name" value={agent.builder.name} onChange={(event) => updateBuilder('name', event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Name" />
          <input aria-label="Category" value={agent.category} onChange={(event) => { AgentWorkspaceService.updateAgent(agent.id, (item) => ({ ...item, category: event.target.value || 'assistant' })); refresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Category" />
          <input aria-label="Provider" value={agent.builder.provider} onChange={(event) => updateBuilder('provider', event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Provider" />
          <input aria-label="Model" value={agent.builder.model} onChange={(event) => updateBuilder('model', event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Model" />
          <input aria-label="Temperature" type="number" step="0.1" value={agent.builder.temperature} onChange={(event) => updateBuilder('temperature', Number(event.target.value))} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" />
          <input aria-label="Top P" type="number" step="0.1" value={agent.builder.topP} onChange={(event) => updateBuilder('topP', Number(event.target.value))} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" />
          <input aria-label="Top K" type="number" value={agent.builder.topK} onChange={(event) => updateBuilder('topK', Number(event.target.value))} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" />
          <input aria-label="Max tokens" type="number" value={agent.builder.maxTokens} onChange={(event) => updateBuilder('maxTokens', Number(event.target.value))} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" />
          <input aria-label="Timeout" type="number" value={agent.builder.timeoutMs} onChange={(event) => updateBuilder('timeoutMs', Number(event.target.value))} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" />
          <input aria-label="Retry policy" type="number" value={agent.builder.retryPolicy} onChange={(event) => updateBuilder('retryPolicy', Number(event.target.value))} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" />
          <input aria-label="Safety" value={agent.builder.safety} onChange={(event) => updateBuilder('safety', event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Safety" />
          <input aria-label="Permissions" value={agent.builder.permissions} onChange={(event) => updateBuilder('permissions', event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Permissions" />
        </div>
        <textarea aria-label="Description" value={agent.builder.description} onChange={(event) => updateBuilder('description', event.target.value)} className="mt-3 min-h-16 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Description" />
        <textarea aria-label="System instructions" value={agent.builder.systemInstructions} onChange={(event) => updateBuilder('systemInstructions', event.target.value)} className="mt-3 min-h-20 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="System instructions" />
        <textarea aria-label="Main prompt" value={agent.builder.mainPrompt} onChange={(event) => updateBuilder('mainPrompt', event.target.value)} className="mt-3 min-h-20 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Main prompt" />
        <textarea aria-label="Output schema" value={agent.builder.outputSchema} onChange={(event) => updateBuilder('outputSchema', event.target.value)} className="mt-3 min-h-20 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Output schema" />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          {[
            ['streaming', agent.builder.streaming],
            ['vision', agent.builder.vision],
            ['audio', agent.builder.audio],
            ['image', agent.builder.image],
            ['tools', agent.builder.tools],
            ['functionCalling', agent.builder.functionCalling],
            ['jsonMode', agent.builder.jsonMode],
            ['observabilityEnabled', agent.builder.observabilityEnabled],
          ].map(([key, value]) => (
            <label key={String(key)} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(event) => updateBuilder(key as keyof AgentRecord['builder'], event.target.checked)}
              />
              <span>{String(key)}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Tools" description="Connected to existing workspace services without new execution engine.">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {agent.tools.map((tool) => (
            <label key={tool.id} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">
              <input type="checkbox" checked={tool.enabled} onChange={() => toggleTool(tool.id)} />
              <span>{tool.id}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Variables, Tags, Versions" description="Manage parameters, tagging and snapshots.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <input value={varName} onChange={(event) => setVarName(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Variable name" />
          <input value={varValue} onChange={(event) => setVarValue(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Variable value" />
          <button type="button" onClick={addVariable} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 text-sm font-semibold text-white">Add Variable</button>
          <button type="button" onClick={() => { AgentWorkspaceService.createVersion(agent.id, 'Manual snapshot'); refresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Create Version</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {agent.variables.map((item) => <span key={item.id} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-xs">{item.name}={item.value}</span>)}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input value={tagInput} onChange={(event) => setTagInput(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Tag" />
          <button type="button" onClick={() => { AgentWorkspaceService.addTag(agent.id, tagInput); setTagInput(''); refresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Add Tag</button>
          {agent.tags.map((tag) => <span key={tag} className="rounded-xl bg-[var(--surface-strong)] px-2 py-1 text-xs">{tag}</span>)}
        </div>
      </Section>

      <Section title="Memory" description="Short, long and pinned memory with context sources.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <input value={memoryTitle} onChange={(event) => setMemoryTitle(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Memory title" />
          <input value={memoryContent} onChange={(event) => setMemoryContent(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Memory content" />
          <button type="button" onClick={() => addMemory('short')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Add Short</button>
          <button type="button" onClick={() => addMemory('long')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Add Long</button>
          <button type="button" onClick={() => addMemory('pinned')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Add Pinned</button>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {agent.memories.slice(0, 8).map((item) => (
            <div key={item.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
              <p className="font-semibold text-[var(--sea-ink)]">{item.kind} | {item.title}</p>
              <p className="mt-1 text-[var(--sea-ink-soft)]">{item.content}</p>
              <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">{item.sourceType} | {new Date(item.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Workflows & Automation" description="Builder for steps, branching placeholders, scheduling and manual run.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <input value={workflowName} onChange={(event) => setWorkflowName(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Workflow name" />
          <button type="button" onClick={() => { AgentWorkspaceService.createWorkflow(agent.id, workflowName); setWorkflowName(''); refresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Create Workflow</button>
          <input value={automationName} onChange={(event) => setAutomationName(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Automation name" />
          <button type="button" onClick={() => { AgentWorkspaceService.createAutomation(agent.id, workflows[0]?.id, automationName); setAutomationName(''); refresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Create Automation</button>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="space-y-2 text-sm">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
                <p className="font-semibold text-[var(--sea-ink)]">{workflow.name}</p>
                <p className="text-[var(--sea-ink-soft)]">status {workflow.status} | steps {workflow.steps.length} | schedule {workflow.schedule}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" onClick={() => { AgentWorkspaceService.runWorkflowManual(workflow.id); refresh() }} className="rounded-xl bg-[var(--lagoon-deep)] px-2 py-1 text-xs text-white">Run</button>
                  <button type="button" onClick={() => { AgentWorkspaceService.updateWorkflow(workflow.id, (item) => ({ ...item, status: 'paused' })); refresh() }} className="rounded-xl border border-[var(--line)] px-2 py-1 text-xs">Pause</button>
                  <button type="button" onClick={() => { AgentWorkspaceService.updateWorkflow(workflow.id, (item) => ({ ...item, status: 'running' })); refresh() }} className="rounded-xl border border-[var(--line)] px-2 py-1 text-xs">Resume</button>
                  <button type="button" onClick={() => { AgentWorkspaceService.updateWorkflow(workflow.id, (item) => ({ ...item, status: 'cancelled' })); refresh() }} className="rounded-xl border border-[var(--line)] px-2 py-1 text-xs">Cancel</button>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm">
            {automations.map((automation) => (
              <div key={automation.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
                <p className="font-semibold text-[var(--sea-ink)]">{automation.name}</p>
                <p className="text-[var(--sea-ink-soft)]">{automation.triggerType} | {automation.triggerValue} | queue {automation.queue} | {automation.status}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" onClick={() => { AgentWorkspaceService.runAutomationManual(automation.id); refresh() }} className="rounded-xl bg-[var(--lagoon-deep)] px-2 py-1 text-xs text-white">Manual Run</button>
                  <button type="button" onClick={() => { AgentWorkspaceService.updateAutomation(automation.id, (item) => ({ ...item, triggerType: 'scheduled', triggerValue: 'daily 08:00' })); refresh() }} className="rounded-xl border border-[var(--line)] px-2 py-1 text-xs">Schedule</button>
                  <button type="button" onClick={() => { AgentWorkspaceService.updateAutomation(automation.id, (item) => ({ ...item, triggerType: 'cron', triggerValue: '0 8 * * *' })); refresh() }} className="rounded-xl border border-[var(--line)] px-2 py-1 text-xs">Cron</button>
                  <button type="button" onClick={() => { AgentWorkspaceService.updateAutomation(automation.id, (item) => ({ ...item, triggerType: 'webhook', triggerValue: '/api/agents/webhook' })); refresh() }} className="rounded-xl border border-[var(--line)] px-2 py-1 text-xs">Webhook UI</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Documentation, Comments, Observability" description="Logs, timeline, diagnostics, retries, failures and charts.">
        <textarea value={agent.documentation} onChange={(event) => { AgentWorkspaceService.setDocumentation(agent.id, event.target.value); refresh() }} className="min-h-20 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Documentation" />
        <div className="mt-3 flex gap-2">
          <input value={comment} onChange={(event) => setComment(event.target.value)} className="flex-1 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" placeholder="Comment" />
          <button type="button" onClick={() => { AgentWorkspaceService.addComment(agent.id, actorName, comment); setComment(''); refresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">Add</button>
          <button type="button" onClick={() => { AgentWorkspaceService.runAgentManual(agent.id); refresh() }} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 text-sm font-semibold text-white">Run Agent</button>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-xs text-[var(--sea-ink-soft)]">
            {agent.timeline.slice(0, 8).map((item) => <p key={item.id}>{item.at} | {item.type} | {item.message}</p>)}
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-xs text-[var(--sea-ink-soft)]">
            {agent.diagnostics.slice(0, 8).map((item) => <p key={item.id}>latency {item.latencyMs}ms | tokens {item.tokens} | cost {item.cost.toFixed(6)} | retries {item.retries} | failures {item.failures}</p>)}
          </div>
        </div>
      </Section>
    </div>
  )
}

export default function AgentWorkspace() {
  const business = useBusiness()
  const { store, filteredAgents, filters, setFilters, summary, toolsCatalog, refresh } = useAgentWorkspace()
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(filteredAgents.at(0)?.id ?? null)
  const [newAgentName, setNewAgentName] = useState('')
  const currentSession = business.currentSession

  const selected = useMemo<AgentRecord | undefined>(
    () => findAgentById(store.agents, selectedAgentId) ?? filteredAgents.at(0),
    [store.agents, filteredAgents, selectedAgentId],
  )
  const actorName = currentSession
    ? business.snapshot.users.find((user) => user.id === currentSession.userId)?.username ?? 'System'
    : (business.snapshot.users.at(0)?.username ?? 'System')

  const workflows = useMemo(() => store.workflows.filter((item) => item.agentId === selected?.id), [store.workflows, selected?.id])
  const automations = useMemo(() => store.automations.filter((item) => item.agentId === selected?.id), [store.automations, selected?.id])

  return (
    <div className="space-y-6">
      <Section title="Agents Workspace" description="Create, edit, duplicate, archive and automate AI agents without code.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Agents</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.totalAgents}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Active</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.activeAgents}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Favorites</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.favoriteAgents}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Automations</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.automations}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Cost</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">${summary.totalCost.toFixed(6)}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Latency</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.averageLatencyMs} ms</p></div>
        </div>
      </Section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.6fr]">
        <section className="space-y-4 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
          <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Agents List</h3>
          <div className="grid gap-2">
            <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search" className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm" />
            <div className="grid gap-2 sm:grid-cols-2">
              <input value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value || 'all' })} placeholder="Category" className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm" />
              <input value={filters.tag} onChange={(event) => setFilters({ ...filters, tag: event.target.value })} placeholder="Tag" className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm" />
              <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value as typeof filters.status })} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm">
                {['all', 'idle', 'running', 'paused', 'completed', 'failed', 'cancelled'].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value as typeof filters.sort })} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm">
                <option value="updatedAt:desc">updated desc</option>
                <option value="updatedAt:asc">updated asc</option>
                <option value="name:asc">name asc</option>
                <option value="name:desc">name desc</option>
              </select>
              <label className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm">
                <input type="checkbox" checked={filters.favoritesOnly} onChange={(event) => setFilters({ ...filters, favoritesOnly: event.target.checked })} />
                favorites only
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <input value={newAgentName} onChange={(event) => setNewAgentName(event.target.value)} placeholder="New agent name" className="flex-1 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm" />
            <button type="button" onClick={() => { const created = AgentWorkspaceService.createAgent(newAgentName, 'assistant'); setSelectedAgentId(created.id); setNewAgentName(''); refresh() }} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 text-sm font-semibold text-white">Create</button>
            <button type="button" onClick={() => AgentWorkspaceService.exportAgents()} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm">Export</button>
          </div>

          <div className="space-y-2 text-sm">
            {filteredAgents.length === 0 ? (
              <EmptyState eyebrow="Agents" illustration={<span aria-hidden>AI</span>} title="No agents" description="Create your first no-code AI agent." />
            ) : null}
            {filteredAgents.map((agent) => (
              <article key={agent.id} className={`rounded-2xl border p-3 ${selected?.id === agent.id ? 'border-[var(--lagoon)] bg-[var(--surface)]' : 'border-[var(--line)] bg-[var(--surface-strong)]'}`}>
                <button type="button" onClick={() => setSelectedAgentId(agent.id)} className="w-full text-left">
                  <p className="font-semibold text-[var(--sea-ink)]">{agent.builder.name}</p>
                  <p className="text-xs text-[var(--sea-ink-soft)]">{agent.category} | {agent.status} | {agent.builder.provider}/{agent.builder.model}</p>
                </button>
                <div className="mt-2 flex flex-wrap gap-1">
                  <button type="button" onClick={() => { AgentWorkspaceService.toggleFavorite(agent.id); refresh() }} className="rounded-xl border border-[var(--line)] px-2 py-1 text-xs">{agent.favorite ? 'Unfavorite' : 'Favorite'}</button>
                  <button type="button" onClick={() => { const dup = AgentWorkspaceService.duplicateAgent(agent.id); if (dup) setSelectedAgentId(dup.id); refresh() }} className="rounded-xl border border-[var(--line)] px-2 py-1 text-xs">Duplicate</button>
                  <button type="button" onClick={() => { AgentWorkspaceService.archiveAgent(agent.id); refresh() }} className="rounded-xl border border-[var(--line)] px-2 py-1 text-xs">Archive</button>
                  <button type="button" onClick={() => { AgentWorkspaceService.deleteAgent(agent.id); setSelectedAgentId(null); refresh() }} className="rounded-xl border border-[rgba(223,78,78,0.24)] px-2 py-1 text-xs text-[#9b2f2f]">Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          {!selected ? (
            <EmptyState eyebrow="Agent Builder" illustration={<span aria-hidden>Build</span>} title="Select an agent" description="Choose an agent from the list or create one." />
          ) : (
            <EditorPane agent={selected} workflows={workflows} automations={automations} actorName={actorName} refresh={refresh} />
          )}
        </section>
      </div>

      <Section title="Connected Tools Catalog" description="Only wired to existing workspace capabilities.">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4 text-xs text-[var(--sea-ink-soft)]">
          {toolsCatalog.map((tool) => (
            <div key={tool.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
              <p className="font-semibold text-[var(--sea-ink)]">{tool.label}</p>
              <p>{tool.id}</p>
              <p>{tool.source}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Observability" description="Timeline, events, diagnostics, retries, failures, latency, tokens and cost mini charts.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p>Executions</p><p className="font-semibold text-[var(--sea-ink)]">{summary.totalExecutions}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p>Failures</p><p className="font-semibold text-[var(--sea-ink)]">{summary.failures}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p>Retries</p><p className="font-semibold text-[var(--sea-ink)]">{summary.retries}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p>Tokens</p><p className="font-semibold text-[var(--sea-ink)]">{summary.totalTokens}</p></div>
        </div>
        <div className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-xs text-[var(--sea-ink-soft)]">
          <p>Costs graph: {sparkline(summary.charts.costs)}</p>
          <p>Latency graph: {sparkline(summary.charts.latencies)}</p>
          <p>Tokens graph: {sparkline(summary.charts.tokens)}</p>
        </div>
      </Section>
    </div>
  )
}
