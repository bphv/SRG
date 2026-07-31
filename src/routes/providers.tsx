import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'

export const Route = createFileRoute('/providers')({
  component: ProvidersPage,
})

function ProvidersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Providers" description="Configure AI providers used by SRG." />
      <Section title="Providers" description="Provider definitions and connection status.">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 text-[var(--sea-ink-soft)]">
          Providers page content placeholder.
        </div>
      </Section>
    </div>
  )
}
