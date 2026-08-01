import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import EmptyState from '#/app/components/EmptyState'
import PageHeader from '#/app/components/PageHeader'
import SearchBar from '#/app/components/SearchBar'
import Section from '#/app/components/Section'
import WorkspaceSkeleton from '#/app/components/WorkspaceSkeleton'
import { Field, FieldGroup, FormSection } from '#/app/components/ui/FormPrimitives'
import { useBusiness } from '#/app/hooks/useBusiness'
import { PromptReviewService } from '#/app/services/PromptReviewService'
import type { PromptReview, PromptReviewDecisionAction, PromptReviewRole, PromptReviewStatus } from '#/app/services/PromptReviewService'

export const Route = createFileRoute('/reviews')({
  component: ReviewsPage,
})

type PendingDecision = {
  review: PromptReview
  action: PromptReviewDecisionAction
}

function ReviewsPage() {
  const business = useBusiness()
  const actorId = business.currentSession ? business.currentSession.userId : (business.snapshot.users[0]?.id ?? 'system')
  const actorName = business.snapshot.users.find((item) => item.id === actorId)?.username ?? 'System'
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | PromptReviewStatus>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | PromptReviewRole>('all')
  const [pageSize, setPageSize] = useState(8)
  const [page, setPage] = useState(1)
  const [refreshTick, setRefreshTick] = useState(0)
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null)
  const [reason, setReason] = useState('')
  const [internalComment, setInternalComment] = useState('')
  const [actorRole, setActorRole] = useState<PromptReviewRole>('moderator')

  const reviews = useMemo(() => PromptReviewService.list(), [refreshTick])
  const summary = PromptReviewService.summary()

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase()
    return reviews.filter((review) => {
      if (statusFilter !== 'all' && review.status !== statusFilter) return false
      if (roleFilter !== 'all' && review.reviewerRole !== roleFilter) return false
      if (!query) return true
      return `${review.authorName} ${review.comment} ${review.moderationReason ?? ''} ${review.internalComment ?? ''}`.toLowerCase().includes(query)
    })
  }, [reviews, search, statusFilter, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize))
  const paginatedReviews = filteredReviews.slice((page - 1) * pageSize, page * pageSize)

  if (reviews.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reviews" description="File de modération, arbitrage et qualité des prompts marketplace." />
        <WorkspaceSkeleton variant="dashboard" description="Chargement de la file de reviews marketplace." />
        <EmptyState
          eyebrow="Marketplace"
          illustration={<span aria-hidden>◌</span>}
          title="Aucune review disponible"
          description="Les reviews apparaîtront ici après publication ou signalement depuis le marketplace."
          action={<Link to="/prompt-studio" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 text-sm font-semibold text-white">Retour au studio</Link>}
        />
      </div>
    )
  }

  const openDecision = (review: PromptReview, action: PromptReviewDecisionAction) => {
    setPendingDecision({ review, action })
    setReason('')
    setInternalComment('')
    setActorRole(review.reviewerRole ?? 'moderator')
  }

  const confirmDecision = () => {
    if (!pendingDecision || !reason.trim()) return

    const { review, action } = pendingDecision
    if (action === 'approve') {
      PromptReviewService.approve(review.id, actorName, reason, internalComment, actorRole)
    } else if (action === 'reject') {
      PromptReviewService.reject(review.id, actorName, reason, internalComment, actorRole)
    } else if (action === 'hide') {
      PromptReviewService.hide(review.id, actorName, reason, internalComment, actorRole)
    } else if (action === 'delete') {
      PromptReviewService.delete(review.id, actorName, reason, internalComment, 'administrator')
    } else {
      PromptReviewService.report(review.id, actorName, reason)
    }

    setPendingDecision(null)
    setReason('')
    setInternalComment('')
    setRefreshTick((current) => current + 1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="File de modération, arbitrage et qualité des prompts marketplace."
        actions={<Link to="/prompt-studio" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)]">Retour au studio</Link>}
      />

      <Section title="Synthèse" description="Répartition des reviews et modération.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {[
            { label: 'Pending', value: summary.pending },
            { label: 'Approved', value: summary.approved },
            { label: 'Rejected', value: summary.rejected },
            { label: 'Hidden', value: summary.hidden },
            { label: 'Reported', value: summary.reported },
            { label: 'Deleted', value: summary.deleted },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 shadow-[var(--srg-shadow-md)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{item.value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Recherche et filtres" description="Statut, rôle, texte et pagination.">
        <FormSection title="Review filters" description="Cross-workspace search and role/status slicing.">
          <FieldGroup columns={4}>
            <Field label="Search">
              <SearchBar
                value={search}
                onSearch={(value) => { setSearch(value); setPage(1) }}
                onValueChange={(value) => { setSearch(value); setPage(1) }}
                placeholder="Search review, reason, internal note"
                instant
                persistKey="reviews-search"
              />
            </Field>
            <Field label="Status">
              <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as 'all' | PromptReviewStatus); setPage(1) }}>
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="hidden">Hidden</option>
                <option value="reported">Reported</option>
                <option value="deleted">Deleted</option>
              </select>
            </Field>
            <Field label="Role">
              <select value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value as 'all' | PromptReviewRole); setPage(1) }}>
                <option value="all">All roles</option>
                <option value="reviewer">Reviewer</option>
                <option value="moderator">Moderator</option>
                <option value="administrator">Administrator</option>
              </select>
            </Field>
            <Field label="Page size">
              <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>
                <option value={6}>6 rows</option>
                <option value={8}>8 rows</option>
                <option value={12}>12 rows</option>
              </select>
            </Field>
          </FieldGroup>
        </FormSection>
      </Section>

      <Section title="Queue de reviews" description="Reviews en attente, signalées, rejetées et approuvées.">
        <div className="space-y-4">
          {paginatedReviews.length === 0 ? (
            <EmptyState
              eyebrow="Reviews"
              illustration={<span aria-hidden>⌕</span>}
              title="Aucun résultat"
              description="Aucune review ne correspond aux filtres actifs."
            />
          ) : null}

          {paginatedReviews.map((review) => (
            <article key={review.id} className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{review.status}</p>
                  <h3 className="mt-2 text-xl font-semibold text-[var(--srg-text-title)]">{review.authorName}</h3>
                  <p className="mt-1 text-sm text-[var(--srg-text-muted)]">Prompt {review.promptId} • {review.stars}/5 • {review.reviewerRole ?? 'reviewer'}</p>
                </div>
                <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm text-[var(--srg-text-muted)]">{new Date(review.createdAt).toLocaleString()}</div>
              </div>

              <p className="mt-4 whitespace-pre-wrap rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-title)]">{review.comment}</p>

              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-muted)]">
                  <p className="font-semibold text-[var(--srg-text-title)]">Décision principale</p>
                  <p className="mt-1">{review.moderationReason ?? 'Aucune raison renseignée.'}</p>
                </div>
                <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-muted)]">
                  <p className="font-semibold text-[var(--srg-text-title)]">Commentaire interne</p>
                  <p className="mt-1">{review.internalComment ?? 'Aucun commentaire interne.'}</p>
                </div>
                <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-muted)]">
                  <p className="font-semibold text-[var(--srg-text-title)]">Historique</p>
                  <p className="mt-1">{review.decisions.length} décisions</p>
                </div>
              </div>

              {review.decisions.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {review.decisions.map((decision) => (
                    <div key={decision.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-xs text-[var(--srg-text-muted)]">
                      <span className="font-semibold text-[var(--srg-text-title)]">{decision.action}</span> • {decision.actorName} • {decision.actorRole} • {decision.reason}
                      {decision.internalComment ? <span> • {decision.internalComment}</span> : null}
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => openDecision(review, 'approve')} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Validation</button>
                <button type="button" onClick={() => openDecision(review, 'reject')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Refus</button>
                <button type="button" onClick={() => openDecision(review, 'hide')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Masquer</button>
                <button type="button" onClick={() => openDecision(review, 'report')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Signalement</button>
                <button type="button" onClick={() => openDecision(review, 'delete')} className="rounded-3xl border border-[rgba(223,78,78,0.24)] bg-[rgba(223,78,78,0.08)] px-4 py-2 text-sm font-semibold text-[#9b2f2f]">Suppression</button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--srg-text-muted)]">
          <span>Page {page} / {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 disabled:opacity-50">Précédente</button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 disabled:opacity-50">Suivante</button>
          </div>
        </div>
      </Section>

      {pendingDecision ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[0_24px_50px_rgba(30,90,72,0.24)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{pendingDecision.action}</p>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">Décision sur la review</h3>
              </div>
              <button type="button" onClick={() => setPendingDecision(null)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm">Fermer</button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <select value={actorRole} onChange={(event) => setActorRole(event.target.value as PromptReviewRole)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm">
                  <option value="reviewer">Reviewer</option>
                  <option value="moderator">Moderator</option>
                  <option value="administrator">Administrator</option>
                </select>
                <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motif obligatoire" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm" />
              </div>
              <textarea value={internalComment} onChange={(event) => setInternalComment(event.target.value)} placeholder="Commentaires internes" className="min-h-28 w-full rounded-[1.5rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm" />
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => setPendingDecision(null)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)]">Annuler</button>
                <button type="button" onClick={confirmDecision} disabled={!reason.trim()} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Confirmer</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
