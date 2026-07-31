export default function TemplateExamples({
  promptExample,
  outputExample,
}: {
  promptExample: string
  outputExample: string
}) {
  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Exemples</h3>
      <div className="mt-5 grid gap-4">
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="font-semibold text-[var(--sea-ink)]">Entrée exemple</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-[var(--sea-ink-soft)]">{promptExample}</pre>
        </div>
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="font-semibold text-[var(--sea-ink)]">Sortie exemple</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-[var(--sea-ink-soft)]">{outputExample}</pre>
        </div>
      </div>
    </div>
  )
}
