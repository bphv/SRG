import { useMemo, useState } from 'react'
import { CollaborationWorkspaceService } from '#/app/services/CollaborationWorkspaceService'
import type {
  CollaborationEntityType,
  CollaborationRole,
  CollaborationWorkflowAction,
  CollaborationWorkflowStatus,
} from '#/app/services/CollaborationWorkspaceService'

const roleOptions: CollaborationRole[] = ['owner', 'administrator', 'editor', 'reviewer', 'viewer']

const workflowActionOptions: Array<{ action: CollaborationWorkflowAction; label: string }> = [
  { action: 'submit_for_review', label: 'Submit for review' },
  { action: 'approve', label: 'Approve' },
  { action: 'reject', label: 'Reject' },
  { action: 'publish', label: 'Publish' },
  { action: 'archive', label: 'Archive' },
  { action: 'restore', label: 'Restore' },
]

export default function CollaborationWorkspacePanel({
  entityType,
  entityId,
  projectId,
  actorId,
  actorName,
  users,
  snapshot,
  onRestoreSnapshot,
}: {
  entityType: CollaborationEntityType
  entityId: string
  projectId?: string
  actorId: string
  actorName: string
  users: Array<{ id: string; username: string }>
  snapshot: string
  onRestoreSnapshot?: (snapshot: string) => void
}) {
  const [refreshTick, setRefreshTick] = useState(0)
  const [inviteUserId, setInviteUserId] = useState(users[0]?.id ?? '')
  const [inviteRole, setInviteRole] = useState<CollaborationRole>('viewer')
  const [versionComment, setVersionComment] = useState('')
  const [versionSummary, setVersionSummary] = useState('')
  const [commentBody, setCommentBody] = useState(CollaborationWorkspaceService.loadDraft(`comment:${entityType}:${entityId}`))
  const [replyBodyById, setReplyBodyById] = useState<Partial<Record<string, string>>>({})
  const [compareIds, setCompareIds] = useState<string[]>([])

  const collaborators = useMemo(
    () => (projectId ? CollaborationWorkspaceService.listCollaborators(projectId) : []),
    [projectId, refreshTick],
  )

  const workflowStatus = useMemo<CollaborationWorkflowStatus>(
    () => CollaborationWorkspaceService.getWorkflowStatus(entityType, entityId),
    [entityType, entityId, refreshTick],
  )

  const versions = useMemo(
    () => CollaborationWorkspaceService.listVersions(entityType, entityId),
    [entityType, entityId, refreshTick],
  )

  const comments = useMemo(
    () => CollaborationWorkspaceService.listComments(entityType, entityId),
    [entityType, entityId, refreshTick],
  )

  const compareVersions = useMemo(() => {
    if (compareIds.length !== 2) {
      return { summary: '' }
    }
    return CollaborationWorkspaceService.compareVersions(compareIds[0], compareIds[1])
  }, [compareIds, refreshTick])

  const selectedInviteUser = users.find((item) => item.id === inviteUserId)

  const doRefresh = () => setRefreshTick((current) => current + 1)

  const invite = () => {
    if (!projectId || !selectedInviteUser) {
      return
    }
    CollaborationWorkspaceService.inviteCollaborator({
      projectId,
      userId: selectedInviteUser.id,
      username: selectedInviteUser.username,
      role: inviteRole,
      actorId,
      actorName,
    })
    doRefresh()
  }

  const createVersion = () => {
    CollaborationWorkspaceService.createVersion({
      entityType,
      entityId,
      authorId: actorId,
      authorName: actorName,
      comment: versionComment.trim() || 'Version update',
      changeSummary: versionSummary.trim() || 'Changes captured from workspace.',
      snapshot,
      projectId,
    })
    setVersionComment('')
    setVersionSummary('')
    doRefresh()
  }

  const addComment = () => {
    if (!commentBody.trim()) {
      return
    }

    CollaborationWorkspaceService.addComment({
      entityType,
      entityId,
      projectId,
      authorId: actorId,
      authorName: actorName,
      body: commentBody,
      attachments: [{ name: 'attachment-placeholder.txt', kind: 'placeholder' }],
    })
    setCommentBody('')
    CollaborationWorkspaceService.saveDraft(`comment:${entityType}:${entityId}`, '')
    doRefresh()
  }

  const transition = (action: CollaborationWorkflowAction) => {
    CollaborationWorkspaceService.transitionWorkflow({
      entityType,
      entityId,
      action,
      actorId,
      actorName,
      projectId,
    })
    doRefresh()
  }

  return (
    <div className="space-y-4 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Collaboration & Versioning</p>
        <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs text-[var(--sea-ink-soft)]">Workflow: {workflowStatus}</span>
      </div>

      {projectId ? (
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
          <p className="text-sm font-semibold text-[var(--sea-ink)]">Collaborateurs</p>
          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_180px_auto]">
            <select value={inviteUserId} onChange={(event) => setInviteUserId(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm">
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </select>
            <select value={inviteRole} onChange={(event) => setInviteRole(event.target.value as CollaborationRole)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm">
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <button type="button" onClick={invite} className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Inviter</button>
          </div>

          <div className="mt-3 space-y-2 text-sm">
            {collaborators.length === 0 ? (
              <p className="text-[var(--sea-ink-soft)]">Aucun collaborateur pour ce projet.</p>
            ) : (
              collaborators.map((item) => (
                <div key={item.id} className="grid gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 md:grid-cols-[1fr_180px_120px_120px_auto_auto] md:items-center">
                  <p className="font-semibold text-[var(--sea-ink)]">{item.username}</p>
                  <p className="text-[var(--sea-ink-soft)]">{item.status}</p>
                  <button
                    type="button"
                    onClick={() => {
                      CollaborationWorkspaceService.acceptInvitation(item.id, actorId, actorName)
                      doRefresh()
                    }}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-xs"
                  >
                    Accept
                  </button>
                  <select value={item.role} onChange={(event) => { CollaborationWorkspaceService.changeCollaboratorRole(item.id, event.target.value as CollaborationRole, actorId, actorName); doRefresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-2 py-2 text-xs">
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <span className="text-xs text-[var(--sea-ink-soft)]">{new Date(item.updatedAt).toLocaleDateString()}</span>
                  <button type="button" onClick={() => { CollaborationWorkspaceService.removeCollaborator(item.id, actorId, actorName); doRefresh() }} className="rounded-2xl border border-[rgba(223,78,78,0.24)] bg-[rgba(223,78,78,0.08)] px-3 py-2 text-xs text-[#9b2f2f]">Retirer</button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
        <p className="text-sm font-semibold text-[var(--sea-ink)]">Validation Workflow</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {workflowActionOptions.map((item) => (
            <button key={item.action} type="button" onClick={() => transition(item.action)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--sea-ink)]">
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--sea-ink)]">Versions</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => CollaborationWorkspaceService.exportVersions(entityType, entityId, 'json')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs">JSON</button>
            <button type="button" onClick={() => CollaborationWorkspaceService.exportVersions(entityType, entityId, 'csv')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs">CSV</button>
            <button type="button" onClick={() => CollaborationWorkspaceService.exportVersions(entityType, entityId, 'markdown')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs">Markdown</button>
          </div>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <input value={versionComment} onChange={(event) => setVersionComment(event.target.value)} placeholder="Commentaire de version" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm" />
          <input value={versionSummary} onChange={(event) => setVersionSummary(event.target.value)} placeholder="Résumé des changements" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm" />
        </div>

        <button type="button" onClick={createVersion} className="mt-3 rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Créer version</button>

        <div className="mt-3 space-y-2 text-sm">
          {versions.length === 0 ? <p className="text-[var(--sea-ink-soft)]">Aucune version custom.</p> : versions.map((item) => (
            <div key={item.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-[var(--sea-ink)]">v{item.versionNumber} • {item.authorName}</p>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-1 text-xs text-[var(--sea-ink-soft)]"><input type="checkbox" checked={compareIds.includes(item.id)} onChange={(event) => setCompareIds((current) => event.target.checked ? [...current.filter((id) => id !== item.id), item.id].slice(-2) : current.filter((id) => id !== item.id))} /> Compare</label>
                  <button type="button" onClick={() => { const restored = CollaborationWorkspaceService.restoreVersion(item.id, actorId, actorName); if (restored && onRestoreSnapshot) { onRestoreSnapshot(restored.snapshot) }; doRefresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-2 py-1 text-xs">Restore</button>
                </div>
              </div>
              <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">{item.createdAt} • {item.comment}</p>
              <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">{item.changeSummary}</p>
            </div>
          ))}
        </div>

        {compareVersions.summary ? (
          <div className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-xs text-[var(--sea-ink-soft)]">
            {compareVersions.summary}
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--sea-ink)]">Commentaires</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => CollaborationWorkspaceService.exportComments(entityType, entityId, 'json')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs">JSON</button>
            <button type="button" onClick={() => CollaborationWorkspaceService.exportComments(entityType, entityId, 'csv')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs">CSV</button>
            <button type="button" onClick={() => CollaborationWorkspaceService.exportComments(entityType, entityId, 'markdown')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs">Markdown</button>
          </div>
        </div>

        <textarea value={commentBody} onChange={(event) => { setCommentBody(event.target.value); CollaborationWorkspaceService.saveDraft(`comment:${entityType}:${entityId}`, event.target.value) }} placeholder="Ajouter un commentaire (mentions: @username)" className="mt-3 min-h-24 w-full rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm" />
        <button type="button" onClick={addComment} className="mt-3 rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Commenter</button>

        <div className="mt-3 space-y-2 text-sm">
          {comments.length === 0 ? <p className="text-[var(--sea-ink-soft)]">Aucun commentaire.</p> : comments.map((item) => (
            <div key={item.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-[var(--sea-ink)]">{item.authorName}</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { CollaborationWorkspaceService.resolveComment(item.id, !item.resolved); doRefresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-2 py-1 text-xs">{item.resolved ? 'Reopen' : 'Resolve'}</button>
                </div>
              </div>
              <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">{item.body}</p>
              {item.mentions.length > 0 ? <p className="mt-1 text-xs text-[var(--lagoon-deep)]">Mentions: {item.mentions.join(', ')}</p> : null}
              <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">Attachments: {item.attachments.map((attachment) => attachment.name).join(', ') || 'none'}</p>

              <div className="mt-2 rounded-2xl bg-[var(--surface-strong)] p-2">
                {item.replies.length === 0 ? <p className="text-xs text-[var(--sea-ink-soft)]">No replies.</p> : item.replies.map((reply) => (
                  <p key={reply.id} className="text-xs text-[var(--sea-ink-soft)]">{reply.authorName}: {reply.body}</p>
                ))}
                <div className="mt-2 flex gap-2">
                  <input value={replyBodyById[item.id] ?? ''} onChange={(event) => setReplyBodyById((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Répondre" className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs" />
                  <button type="button" onClick={() => { const value = replyBodyById[item.id]?.trim(); if (!value) { return }; CollaborationWorkspaceService.replyComment({ commentId: item.id, authorId: actorId, authorName: actorName, body: value }); setReplyBodyById((current) => ({ ...current, [item.id]: '' })); doRefresh() }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs">Reply</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
