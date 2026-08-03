import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <div className="space-y-6">
      <PageHeader title="About" description="SRG Enterprise Intelligence Platform centralise projets, prompts, generation, providers et connaissances dans un workspace enterprise coherent." />
      <Section title="Plateforme" description="Vue produit de la couche applicative SRG.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: 'Projects', copy: 'Organiser les initiatives, favoris et exports.' },
            { title: 'Prompt Studio', copy: 'Versionner, tester et publier les prompts visibles.' },
            { title: 'Generate', copy: 'Exécuter les scénarios IA avec options avancées.' },
            { title: 'Knowledge Center', copy: 'Diffuser guides, FAQ, exemples et références.' },
          ].map((item) => (
            <div key={item.title} className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{item.title}</p>
              <p className="mt-3 text-sm text-[var(--srg-text-muted)]">{item.copy}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
