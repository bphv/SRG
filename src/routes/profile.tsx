import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import { useBusiness } from '#/app/hooks/useBusiness'
import { useTheme } from '#/app/hooks/useTheme'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const business = useBusiness()
  const theme = useTheme()
  const fallbackUserId = business.currentSession?.userId ?? business.snapshot.users.at(0)?.id ?? ''

  const profile = useMemo(
    () => (fallbackUserId ? business.getUserProfileSnapshot(fallbackUserId) : undefined),
    [business, fallbackUserId],
  )

  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [language, setLanguage] = useState(profile?.language ?? '')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [company, setCompany] = useState(profile?.company ?? '')
  const [notifyByEmail, setNotifyByEmail] = useState(true)
  const [notifyBySms, setNotifyBySms] = useState(false)
  const [sessionQuery, setSessionQuery] = useState('')
  const [sessionState, setSessionState] = useState<'all' | 'active' | 'closed'>('all')
  const [sessionSort, setSessionSort] = useState<'lastActivityDesc' | 'createdDesc' | 'deviceAsc'>('lastActivityDesc')
  const [sessionPage, setSessionPage] = useState(1)
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([])
  const [status, setStatus] = useState('')

  const sessionHistory = useMemo(
    () => (profile ? business.getSessionHistory(profile.userId) : []),
    [business, profile],
  )

  const passwordPolicy = useMemo(
    () => (profile ? business.getPasswordPolicySnapshot(profile.userId) : undefined),
    [business, profile],
  )

  const filteredSessions = useMemo(() => {
    const query = sessionQuery.trim().toLowerCase()
    const now = Date.now()

    return sessionHistory
      .filter((session) => {
        if (sessionState === 'active' && !session.active) {
          return false
        }
        if (sessionState === 'closed' && session.active) {
          return false
        }
        if (!query) {
          return true
        }

        return (
          session.sessionId.toLowerCase().includes(query) ||
          session.deviceName.toLowerCase().includes(query) ||
          (session.userAgent ?? '').toLowerCase().includes(query) ||
          (session.ipAddress ?? '').toLowerCase().includes(query)
        )
      })
      .sort((left, right) => {
        if (sessionSort === 'deviceAsc') {
          return left.deviceName.localeCompare(right.deviceName)
        }
        if (sessionSort === 'createdDesc') {
          return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
        }
        const rightTime = right.active ? now : new Date(right.lastActivityAt).getTime()
        const leftTime = left.active ? now : new Date(left.lastActivityAt).getTime()
        return rightTime - leftTime
      })
  }, [sessionHistory, sessionQuery, sessionSort, sessionState])

  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize))
  const clampedPage = Math.min(sessionPage, totalPages)
  const paginatedSessions = filteredSessions.slice((clampedPage - 1) * pageSize, clampedPage * pageSize)
  const currentSessionId = business.currentSession?.sessionId

  const selectedSessionsOnPage = paginatedSessions.filter((session) => selectedSessionIds.includes(session.sessionId))
  const canSelectCurrent = (sessionId: string) => sessionId !== currentSessionId

  const formatDuration = (createdAt: string, lastActivityAt: string) => {
    const start = new Date(createdAt).getTime()
    const end = new Date(lastActivityAt).getTime()
    const totalMinutes = Math.max(1, Math.round((end - start) / 60000))
    if (totalMinutes < 60) {
      return `${totalMinutes} min`
    }
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours} h ${minutes} min`
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeader title="Profil Utilisateur" description="Détails du compte, sécurité et appareils." />
        <Section title="Profil" description="Informations de compte.">
          <p className="text-sm text-[var(--srg-text-muted)]">Aucun utilisateur actif.</p>
        </Section>
      </div>
    )
  }

  const changePassword = () => {
    try {
      business.changePassword(profile.userId, currentPassword, nextPassword)
      setStatus('Mot de passe mis à jour avec succès.')
      setCurrentPassword('')
      setNextPassword('')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Impossible de changer le mot de passe.')
    }
  }

  const changePhone = () => {
    try {
      business.changePhone(profile.userId, phone)
      setStatus('Téléphone mis à jour.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Impossible de changer le téléphone.')
    }
  }

  const changeLanguage = () => {
    try {
      business.changeLanguage(profile.userId, language)
      setStatus('Langue mise à jour.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Impossible de changer la langue.')
    }
  }

  const toggleSessionSelection = (sessionId: string, checked: boolean) => {
    setSelectedSessionIds((current) => {
      if (checked) {
        return current.includes(sessionId) ? current : [...current, sessionId]
      }
      return current.filter((id) => id !== sessionId)
    })
  }

  const toggleSelectAllOnPage = (checked: boolean) => {
    const selectable = paginatedSessions.map((session) => session.sessionId).filter(canSelectCurrent)
    setSelectedSessionIds((current) => {
      if (checked) {
        const merged = new Set([...current, ...selectable])
        return Array.from(merged)
      }
      const toRemove = new Set(selectable)
      return current.filter((id) => !toRemove.has(id))
    })
  }

  const revokeSelected = () => {
    const target = selectedSessionIds.filter((id) => id !== currentSessionId)
    if (target.length === 0) {
      setStatus('Aucune session sélectionnée à révoquer.')
      return
    }
    const revoked = business.revokeUserSessions(profile.userId, target)
    setSelectedSessionIds([])
    setStatus(`${revoked} session(s) révoquée(s).`)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profil Utilisateur" description="Matricule, sécurité, wallet, crédits, plan et appareils connectés." />

      <Section title="Informations" description="Identité et attributs de profil.">
        <div className="mb-4 flex flex-wrap items-center gap-4 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[var(--srg-color-primary-500)] text-2xl font-semibold text-white">
            {photoPreview ? <img src={photoPreview} alt="Photo utilisateur" className="h-20 w-20 object-cover" /> : profile.username.slice(0, 2).toUpperCase()}
          </div>
          <label className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)]">
            Ajouter une photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) {
                  return
                }

                setPhotoPreview(URL.createObjectURL(file))
              }}
            />
          </label>
        </div>
        <div className="grid gap-3 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm md:grid-cols-2">
          <p><strong>Matricule:</strong> {profile.matricule}</p>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Téléphone:</strong> {profile.phone}</p>
          <p><strong>Langue:</strong> {profile.language}</p>
          <p><strong>Pays:</strong> {profile.country}</p>
          <p><strong>Ville:</strong> {profile.city}</p>
          <p><strong>Entreprise:</strong> {profile.company ?? '-'}</p>
          <p><strong>Wallet:</strong> {profile.wallet}</p>
          <p><strong>Crédits:</strong> {profile.credits}</p>
          <p><strong>Plan:</strong> {profile.plan}</p>
          <p><strong>Dernière connexion:</strong> {profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : 'N/A'}</p>
          <p><strong>Appareils connectés:</strong> {profile.connectedDevices}</p>
          <p><strong>Dernier changement password:</strong> {profile.passwordLastChangedAt ? new Date(profile.passwordLastChangedAt).toLocaleString() : 'N/A'}</p>
          <p><strong>Expiration password:</strong> {profile.passwordExpiresAt ? new Date(profile.passwordExpiresAt).toLocaleString() : 'N/A'}</p>
          <p><strong>Alerte expiration:</strong> {profile.passwordExpirationWarning ? 'Oui' : 'Non'}</p>
          <p><strong>Historique mot de passe:</strong> {profile.passwordHistoryCount} / {passwordPolicy?.historyLimit ?? '-'}</p>
          <p><strong>Lockout temporaire:</strong> {profile.temporaryLockoutUntil ? new Date(profile.temporaryLockoutUntil).toLocaleString() : 'Aucun'}</p>
        </div>
      </Section>

      <Section title="Politique de sécurité" description="Avertissement pré-expiration et verrouillage temporaire.">
        <div className="grid gap-3 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm md:grid-cols-2">
          <p><strong>Durée max password:</strong> {passwordPolicy?.maxAgeDays ?? '-'} jours</p>
          <p><strong>Avertissement:</strong> {passwordPolicy?.warningBeforeExpiryDays ?? '-'} jours avant expiration</p>
          <p><strong>Fenêtre lockout:</strong> {passwordPolicy?.temporaryLockoutMinutes ?? '-'} minutes</p>
          <p><strong>Historique requis:</strong> {passwordPolicy?.historyCount ?? 0} / {passwordPolicy?.historyLimit ?? 0}</p>
          <p><strong>État alerte:</strong> {passwordPolicy?.shouldWarn ? 'Password proche expiration' : 'Normal'}</p>
          <p><strong>Verrouillé jusqu’à:</strong> {passwordPolicy?.lockedUntil ? new Date(passwordPolicy.lockedUntil).toLocaleString() : 'Non verrouillé'}</p>
        </div>
      </Section>

      <Section title="Modifier le mot de passe" description="Validation de complexité et anti-réutilisation.">
        <div className="grid gap-3 md:grid-cols-2">
          <input type="password" placeholder="Mot de passe actuel" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
          <input type="password" placeholder="Nouveau mot de passe" value={nextPassword} onChange={(event) => setNextPassword(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
        </div>
        <button type="button" onClick={changePassword} className="mt-3 rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Changer le mot de passe</button>
      </Section>

      <Section title="Modifier le téléphone" description="Numéro unique par utilisateur.">
        <div className="flex flex-wrap gap-3">
          <input value={phone} onChange={(event) => setPhone(event.target.value)} className="min-w-[260px] rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
          <button type="button" onClick={changePhone} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm">Mettre à jour</button>
        </div>
      </Section>

      <Section title="Modifier la langue" description="Préférence locale utilisateur.">
        <div className="flex flex-wrap gap-3">
          <input value={language} onChange={(event) => setLanguage(event.target.value)} className="min-w-[260px] rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
          <button type="button" onClick={changeLanguage} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm">Mettre à jour</button>
        </div>
      </Section>

      <Section title="Préférences" description="Thème, entreprise et canaux de notifications préparés.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-semibold text-[var(--srg-text-title)]">Entreprise</span>
            <input value={company} onChange={(event) => setCompany(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-semibold text-[var(--srg-text-title)]">Thème</span>
            <select value={theme.mode} onChange={(event) => theme.setMode(event.target.value as 'light' | 'dark' | 'system')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </label>
          <label className="inline-flex items-center gap-2 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm text-[var(--srg-text-title)]">
            <input type="checkbox" checked={notifyByEmail} onChange={(event) => setNotifyByEmail(event.target.checked)} />
            <span>Notifications Email</span>
          </label>
          <label className="inline-flex items-center gap-2 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm text-[var(--srg-text-title)]">
            <input type="checkbox" checked={notifyBySms} onChange={(event) => setNotifyBySms(event.target.checked)} />
            <span>Notifications SMS</span>
          </label>
        </div>
      </Section>

      <Section title="Sessions & appareils" description="Filtre, tri, pagination et révocation groupée des sessions utilisateur.">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={sessionQuery}
            onChange={(event) => {
              setSessionQuery(event.target.value)
              setSessionPage(1)
            }}
            placeholder="Recherche session, device, UA, IP"
            className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm"
          />
          <select
            value={sessionState}
            onChange={(event) => {
              setSessionState(event.target.value as 'all' | 'active' | 'closed')
              setSessionPage(1)
            }}
            className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="closed">Fermées</option>
          </select>
          <select
            value={sessionSort}
            onChange={(event) => setSessionSort(event.target.value as 'lastActivityDesc' | 'createdDesc' | 'deviceAsc')}
            className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm"
          >
            <option value="lastActivityDesc">Tri: activité récente</option>
            <option value="createdDesc">Tri: création récente</option>
            <option value="deviceAsc">Tri: nom appareil</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <label className="inline-flex items-center gap-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-xs">
            <input
              type="checkbox"
              checked={selectedSessionsOnPage.length > 0 && selectedSessionsOnPage.length === paginatedSessions.filter((session) => canSelectCurrent(session.sessionId)).length}
              onChange={(event) => toggleSelectAllOnPage(event.target.checked)}
            />
            <span>Sélectionner la page</span>
          </label>
          <button type="button" onClick={revokeSelected} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-xs font-semibold text-white">
            Révoquer la sélection ({selectedSessionIds.length})
          </button>
        </div>

        <div className="mt-3 space-y-2 text-sm">
          {paginatedSessions.length === 0 ? <p className="text-[var(--srg-text-muted)]">Aucune session trouvée.</p> : null}
          {paginatedSessions.map((session) => {
            const isCurrent = session.sessionId === currentSessionId
            const [browser, os] = (session.userAgent ?? 'Unknown Browser / Unknown OS').split(' / ')
            return (
              <div key={session.sessionId} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p><strong>{session.deviceName}</strong> {isCurrent ? '(appareil courant)' : ''}</p>
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      disabled={isCurrent}
                      checked={selectedSessionIds.includes(session.sessionId)}
                      onChange={(event) => toggleSessionSelection(session.sessionId, event.target.checked)}
                    />
                    <span>{isCurrent ? 'Protégée' : 'Sélectionner'}</span>
                  </label>
                </div>
                <p>Session: {session.sessionId}</p>
                <p>Statut: {session.active ? 'active' : 'closed'} · Appareil de confiance: {session.rememberMe ? 'oui' : 'non'}</p>
                <p>Navigateur: {browser} · OS: {os || 'Unknown OS'}</p>
                <p>IP: {session.ipAddress ?? '0.0.0.0'}</p>
                <p>Créée: {new Date(session.createdAt).toLocaleString()} · Dernière activité: {new Date(session.lastActivityAt).toLocaleString()}</p>
                <p>Durée estimée: {formatDuration(session.createdAt, session.lastActivityAt)} · Expire: {new Date(session.expiresAt).toLocaleString()}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-[var(--srg-text-muted)]">
          <span>Page {clampedPage} / {totalPages}</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={clampedPage <= 1}
              onClick={() => setSessionPage((current) => Math.max(1, current - 1))}
              className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-1 disabled:opacity-50"
            >
              Précédente
            </button>
            <button
              type="button"
              disabled={clampedPage >= totalPages}
              onClick={() => setSessionPage((current) => Math.min(totalPages, current + 1))}
              className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-1 disabled:opacity-50"
            >
              Suivante
            </button>
          </div>
        </div>
      </Section>

      {status ? <p className="text-sm text-[var(--srg-text-muted)]">{status}</p> : null}
    </div>
  )
}
