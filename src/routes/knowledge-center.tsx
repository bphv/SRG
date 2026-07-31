import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'

export const Route = createFileRoute('/knowledge-center')({
  component: KnowledgeCenterPage,
})

function KnowledgeCenterPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Knowledge Center" description="Explore guides, patterns and references." />
      <Section title="Knowledge Center" description="A foundation for docs and learning content.">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 text-[var(--sea-ink-soft)]">
          Knowledge Center page content placeholder.
        </div>
      </Section>
    </div>
  )
}
