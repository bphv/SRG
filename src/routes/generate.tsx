import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'

export const Route = createFileRoute('/generate')({
  component: GeneratePage,
})

function GeneratePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Generate" description="Run generation workflows with SRG." />
      <Section title="Generate" description="A place to start AI generation and output review.">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 text-[var(--sea-ink-soft)]">
          Generate page content placeholder.
        </div>
      </Section>
    </div>
  )
}
