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
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Variables</h3>
      <div className="mt-5 space-y-4 text-sm text-[var(--sea-ink-soft)]">
        {variables.map((variable) => (
          <div key={variable.name} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold text-[var(--sea-ink)]">{variable.name}</p>
              <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">{variable.type}</span>
            </div>
            <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">{variable.description}</p>
            {variable.defaultValue ? (
              <p className="mt-3 text-xs text-[var(--sea-ink)]">Valeur par défaut : {variable.defaultValue}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
