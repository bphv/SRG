import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'

export const Route = createFileRoute('/history')({
  component: HistoryPage,
})

function HistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="History" description="Review previous runs and request history." />
      <Section title="History" description="Timeline of SRG executions and results.">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 text-[var(--sea-ink-soft)]">
          History page content placeholder.
        </div>
      </Section>
    </div>
  )
}
