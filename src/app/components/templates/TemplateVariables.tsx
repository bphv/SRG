export type TemplateVariable = {
  name: string
  type: string
  defaultValue?: string
  description: string
}

export default function TemplateVariables({
  variables,
}: {
  variables: TemplateVariable[]
}) {
  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-6 shadow-[var(--srg-shadow-md)]">
      <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Variables</h3>
      <div className="mt-5 space-y-4 text-sm text-[var(--srg-text-muted)]">
        {variables.map((variable) => (
          <div key={variable.name} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold text-[var(--srg-text-title)]">{variable.name}</p>
              <span className="rounded-full bg-[var(--srg-surface-strong)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--srg-text-muted)]">{variable.type}</span>
            </div>
            <p className="mt-3 text-sm text-[var(--srg-text-muted)]">{variable.description}</p>
            {variable.defaultValue ? (
              <p className="mt-3 text-xs text-[var(--srg-text-title)]">Valeur par défaut : {variable.defaultValue}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
