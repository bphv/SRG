export default function TemplateExamples({
  promptExample,
  outputExample,
}: {
  promptExample: string
  outputExample: string
}) {
  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-6 shadow-[var(--srg-shadow-md)]">
      <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Exemples</h3>
      <div className="mt-5 grid gap-4">
        <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
          <p className="font-semibold text-[var(--srg-text-title)]">Entrée exemple</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-[var(--srg-text-muted)]">{promptExample}</pre>
        </div>
        <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
          <p className="font-semibold text-[var(--srg-text-title)]">Sortie exemple</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-[var(--srg-text-muted)]">{outputExample}</pre>
        </div>
      </div>
    </div>
  )
}
