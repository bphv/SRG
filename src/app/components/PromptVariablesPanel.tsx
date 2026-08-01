import type { PromptVariable } from '#/app/services/PromptService'

export default function PromptVariablesPanel({
  variables,
  onChange,
}: {
  variables: PromptVariable[]
  onChange: (name: string, value: string) => void
}) {
  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Variables</p>
        <p className="text-sm text-[var(--srg-text-muted)]">Définissez les valeurs à injecter dans le prompt.</p>
      </div>
      <div className="space-y-4">
        {variables.map((variable) => (
          <div key={variable.name} className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-[var(--srg-text-title)]">{`{{${variable.name}}}`}</p>
              <span className="text-xs text-[var(--srg-text-muted)]">{variable.required ? 'requis' : 'optionnel'}</span>
            </div>
            <p className="text-sm text-[var(--srg-text-muted)]">{variable.description}</p>
            <input
              value={variable.value ?? ''}
              onChange={(event) => onChange(variable.name, event.target.value)}
              className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
              placeholder={variable.example}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
