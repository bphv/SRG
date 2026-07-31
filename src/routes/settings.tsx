import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure SRG preferences and workspace settings." />
      <Section title="Settings" description="Global application configuration and user preferences.">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 text-[var(--sea-ink-soft)]">
          Settings page content placeholder.
        </div>
      </Section>
    </div>
  )
}
