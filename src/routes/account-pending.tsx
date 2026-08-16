import { Link, createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'

export const Route = createFileRoute('/account-pending')({
  validateSearch: (search: Record<string, unknown>) => ({
    status: typeof search.status === 'string' ? search.status : 'PENDING_APPROVAL',
    matricule: typeof search.matricule === 'string' ? search.matricule : undefined,
    username: typeof search.username === 'string' ? search.username : undefined,
  }),
  component: AccountPendingPage,
})

function AccountPendingPage() {
  const { status, matricule, username } = Route.useSearch()

  const message =
    status === 'REJECTED'
      ? "Votre compte a ete rejete. Contactez l'administration pour plus de details."
      : status === 'SUSPENDED'
        ? "Votre compte est suspendu. Contactez l'administration pour reactivation."
        : "Votre compte est en attente d'approbation par un administrateur."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Validation Du Compte"
        description="Le compte est authentifie mais l'acces aux espaces professionnels est bloque tant que l'approbation n'est pas accordee."
      />

      <Section title="Statut du compte" description="Workflow de gouvernance des acces SRG.">
        <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5 text-sm text-[var(--srg-text-muted)]">
          <p className="font-semibold text-[var(--srg-text-title)]">Statut actuel: {status}</p>
          <p className="mt-2">{message}</p>

          {matricule || username ? (
            <div className="mt-4 rounded-2xl border border-[var(--srg-color-primary-500)]/40 bg-[var(--srg-color-primary-500)]/10 p-4">
              {username ? (
                <p className="text-[var(--srg-text-body)]">
                  Username : <strong className="font-mono text-[var(--srg-text-title)]">{username}</strong>
                </p>
              ) : null}
              {matricule ? (
                <p className="mt-1 text-[var(--srg-text-body)]">
                  Matricule SRG : <strong className="font-mono text-[var(--srg-color-primary-500)]">{matricule}</strong>
                </p>
              ) : null}
              <p className="mt-2 text-xs text-[var(--srg-text-muted)]">
                Conservez precieusement ce matricule : il vous permet de vous connecter a votre espace SRG, en plus de votre username.
              </p>
            </div>
          ) : null}

          <p className="mt-4">
            Un administrateur peut approuver, rejeter ou suspendre le compte depuis l'espace Administration.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/auth"
              className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] no-underline"
            >
              Retour a l'authentification
            </Link>
            <Link
              to="/"
              className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white no-underline"
            >
              Retour accueil
            </Link>
          </div>
        </div>
      </Section>
    </div>
  )
}
