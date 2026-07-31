import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import { useBusiness } from '#/app/hooks/useBusiness'
import type { FeatureFlagKey, UserRole } from '#/app/services/business/BusinessFoundationService'

export const Route = createFileRoute('/administration')({
  component: AdministrationPage,
})

type AdminSpace =
  | 'Users'
  | 'Organizations'
  | 'Sessions'
  | 'Security'
  | 'Licenses'
  | 'Credits'
  | 'Wallets'
  | 'Subscriptions'
  | 'Payments'
  | 'Billing'
  | 'Roles'
  | 'Permissions'

const ADMIN_SPACES: AdminSpace[] = [
  'Users',
  'Organizations',
  'Sessions',
  'Security',
  'Licenses',
  'Credits',
  'Wallets',
  'Subscriptions',
  'Payments',
  'Billing',
  'Roles',
  'Permissions',
]

function AdministrationPage() {
  const business = useBusiness()
  const { snapshot, adminCounts } = business

  const [activeSpace, setActiveSpace] = useState<AdminSpace>('Users')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('User')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [country, setCountry] = useState('France')
  const [city, setCity] = useState('Paris')
  const [language, setLanguage] = useState('Français')
  const [timezone, setTimezone] = useState('Europe/Paris')
  const [orgName, setOrgName] = useState('')
  const [orgLegalName, setOrgLegalName] = useState('')
  const [orgCountry, setOrgCountry] = useState('France')
  const [orgCity, setOrgCity] = useState('Paris')
  const [authIdentifier, setAuthIdentifier] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authResult, setAuthResult] = useState('')
  const [forgotIdentifier, setForgotIdentifier] = useState('')
  const [resetTicketId, setResetTicketId] = useState('')
  const [resetPassword, setResetPasswordValue] = useState('')
  const [operationStatus, setOperationStatus] = useState('')
  const [sessionQuery, setSessionQuery] = useState('')
  const [sessionStateFilter, setSessionStateFilter] = useState<'all' | 'active' | 'closed'>('all')
  const [sessionSort, setSessionSort] = useState<'lastActivityDesc' | 'createdDesc' | 'deviceAsc'>('lastActivityDesc')
  const [sessionPage, setSessionPage] = useState(1)
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([])

  const [securityQuery, setSecurityQuery] = useState('')
  const [securityTypeFilter, setSecurityTypeFilter] = useState('all')
  const [securityStatusFilter, setSecurityStatusFilter] = useState<'all' | 'success' | 'failed'>('all')
  const [securityDateFrom, setSecurityDateFrom] = useState('')
  const [securityDateTo, setSecurityDateTo] = useState('')
  const [securitySort, setSecuritySort] = useState<'dateDesc' | 'dateAsc' | 'typeAsc'>('dateDesc')
  const [securityPage, setSecurityPage] = useState(1)

  const selectedUser = snapshot.users[0]

  const roleOptions: UserRole[] = ['SuperAdmin', 'Admin', 'Manager', 'User', 'Guest']
  const flagKeys: FeatureFlagKey[] = ['vision', 'image', 'streaming', 'json', 'audio', 'workflow', 'agents', 'marketplace']

  const latestLogs = useMemo(() => snapshot.logs.slice(0, 6), [snapshot.logs])
  const latestEvents = useMemo(() => snapshot.events.slice(0, 6), [snapshot.events])
  const latestTraces = useMemo(() => snapshot.traces.slice(0, 6), [snapshot.traces])
  const latestMetrics = useMemo(() => snapshot.metrics.slice(0, 6), [snapshot.metrics])
  const sessionHistory = useMemo(() => business.getSessionHistory(selectedUser.id), [business, selectedUser.id])
  const securityEvents = useMemo(() => business.getSecurityEvents(selectedUser.id), [business, selectedUser.id])

  const filteredSessions = useMemo(() => {
    const query = sessionQuery.trim().toLowerCase()
    const now = Date.now()
    return sessionHistory
      .filter((session) => {
        if (sessionStateFilter === 'active' && !session.active) {
          return false
        }
        if (sessionStateFilter === 'closed' && session.active) {
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
  }, [sessionHistory, sessionQuery, sessionStateFilter, sessionSort])

  const sessionPageSize = 6
  const sessionTotalPages = Math.max(1, Math.ceil(filteredSessions.length / sessionPageSize))
  const sessionCurrentPage = Math.min(sessionPage, sessionTotalPages)
  const paginatedSessions = filteredSessions.slice(
    (sessionCurrentPage - 1) * sessionPageSize,
    sessionCurrentPage * sessionPageSize,
  )

  const filteredSecurityEvents = useMemo(() => {
    const query = securityQuery.trim().toLowerCase()
    const from = securityDateFrom ? new Date(`${securityDateFrom}T00:00:00`).getTime() : undefined
    const to = securityDateTo ? new Date(`${securityDateTo}T23:59:59`).getTime() : undefined

    return securityEvents
      .filter((event) => {
        if (securityTypeFilter !== 'all' && event.type !== securityTypeFilter) {
          return false
        }
        if (securityStatusFilter !== 'all' && event.status !== securityStatusFilter) {
          return false
        }

        const eventTime = new Date(event.at).getTime()
        if (from && eventTime < from) {
          return false
        }
        if (to && eventTime > to) {
          return false
        }

        if (!query) {
          return true
        }

        return (
          event.type.toLowerCase().includes(query) ||
          event.message.toLowerCase().includes(query) ||
          (event.userId ?? '').toLowerCase().includes(query) ||
          String(event.metadata?.deviceName ?? '').toLowerCase().includes(query) ||
          String(event.metadata?.ipAddress ?? '').toLowerCase().includes(query)
        )
      })
      .sort((left, right) => {
        if (securitySort === 'typeAsc') {
          return left.type.localeCompare(right.type)
        }
        const delta = new Date(right.at).getTime() - new Date(left.at).getTime()
        return securitySort === 'dateDesc' ? delta : -delta
      })
  }, [securityEvents, securityDateFrom, securityDateTo, securityQuery, securitySort, securityStatusFilter, securityTypeFilter])

  const securityPageSize = 8
  const securityTotalPages = Math.max(1, Math.ceil(filteredSecurityEvents.length / securityPageSize))
  const securityCurrentPage = Math.min(securityPage, securityTotalPages)
  const paginatedSecurityEvents = filteredSecurityEvents.slice(
    (securityCurrentPage - 1) * securityPageSize,
    securityCurrentPage * securityPageSize,
  )

  const securityTypes = useMemo(() => {
    const values = new Set(securityEvents.map((event) => event.type))
    return ['all', ...Array.from(values)]
  }, [securityEvents])

  const csvEscape = (value: string) => `"${value.replaceAll('"', '""')}"`
  const downloadFile = (fileName: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const exportSessionsCsv = () => {
    const rows = filteredSessions.map((session) =>
      [
        session.sessionId,
        session.deviceName,
        session.userAgent ?? '',
        session.ipAddress ?? '',
        session.active ? 'active' : 'closed',
        session.rememberMe ? 'yes' : 'no',
        session.createdAt,
        session.lastActivityAt,
        session.expiresAt,
      ]
        .map(csvEscape)
        .join(','),
    )

    const header = ['sessionId', 'deviceName', 'userAgent', 'ipAddress', 'status', 'trusted', 'createdAt', 'lastActivityAt', 'expiresAt']
      .map(csvEscape)
      .join(',')
    downloadFile('sessions-export.csv', [header, ...rows].join('\n'), 'text/csv;charset=utf-8')
  }

  const exportSecurityJson = () => {
    downloadFile('security-events-export.json', JSON.stringify(filteredSecurityEvents, null, 2), 'application/json;charset=utf-8')
  }

  const handleCreateUser = () => {
    try {
      business.createUser({
        username,
        phone,
        email: email || undefined,
        password,
        role,
        profile: {
          firstName,
          lastName,
          country,
          city,
          preferredLanguage: language,
          timezone,
        },
        organizationId: snapshot.organizations[0]?.id,
        departmentId: snapshot.departments[0]?.id,
        teamId: snapshot.teams[0]?.id,
      })
      setOperationStatus('Utilisateur créé avec succès.')
      setUsername('')
      setPhone('')
      setEmail('')
      setPassword('')
      setFirstName('')
      setLastName('')
    } catch (error) {
      setOperationStatus(error instanceof Error ? error.message : 'Erreur de création utilisateur.')
    }
  }

  const handleCreateOrganization = () => {
    try {
      business.createOrganization({
        name: orgName,
        legalName: orgLegalName,
        country: orgCountry,
        city: orgCity,
      })
      setOperationStatus('Organisation créée avec succès.')
      setOrgName('')
      setOrgLegalName('')
    } catch (error) {
      setOperationStatus(error instanceof Error ? error.message : 'Erreur de création organisation.')
    }
  }

  const handleAuthenticate = () => {
    const result = business.authenticate(authIdentifier, authPassword)
    if (result.success && result.user) {
      setAuthResult(`Connexion réussie pour ${result.user.username} (${result.user.matricule}).`)
    } else {
      setAuthResult(`Échec de connexion: ${result.reason ?? 'unknown'}.`)
    }
  }

  const handleForgotPassword = () => {
    try {
      const ticket = business.requestForgotPassword(forgotIdentifier)
      setOperationStatus(`Ticket de reset généré: ${ticket.ticketId}`)
      setResetTicketId(ticket.ticketId)
    } catch (error) {
      setOperationStatus(error instanceof Error ? error.message : 'Erreur forgot password.')
    }
  }

  const handleResetPassword = () => {
    try {
      business.resetPassword(resetTicketId, resetPassword)
      setOperationStatus('Mot de passe réinitialisé.')
      setResetPasswordValue('')
    } catch (error) {
      setOperationStatus(error instanceof Error ? error.message : 'Erreur reset password.')
    }
  }

  const handleWalletRecharge = () => {
    business.rechargeWallet(selectedUser.id, 100, 'Admin recharge')
    setOperationStatus('Wallet rechargé de 100.')
  }

  const handleWalletBonus = () => {
    business.addWalletBonus(selectedUser.id, 25, 'Bonus admin')
    setOperationStatus('Bonus wallet ajouté (+25).')
  }

  const handleReserveCredit = () => {
    try {
      business.reserveCredit(selectedUser.id, 10, 'Manual admin reservation')
      setOperationStatus('Réservation de crédits effectuée (10).')
    } catch (error) {
      setOperationStatus(error instanceof Error ? error.message : 'Erreur réservation crédits.')
    }
  }

  const handleRefundCredit = () => {
    business.refundCredit(selectedUser.id, 5, 'Admin refund')
    setOperationStatus('Remboursement de crédits effectué (5).')
  }

  const handleCreateSubscription = () => {
    business.createSubscription({ userId: selectedUser.id, planName: 'Professional' })
    setOperationStatus('Abonnement Professional activé.')
  }

  const handleCreateInvoiceAndPayment = () => {
    const invoice = snapshot.invoices[0] ?? (business.createInvoice({ userId: selectedUser.id, amount: 129, currency: 'EUR', taxAmount: 25 }), null)
    const refreshedInvoice = business.snapshot.invoices[0] ?? snapshot.invoices[0]
    const method = snapshot.paymentMethods.find((item) => item.userId === selectedUser.id)
    if (!method) {
      setOperationStatus('Impossible de créer le paiement: méthode ou facture manquante.')
      return
    }

    business.recordPayment({
      invoiceId: refreshedInvoice.id,
      userId: selectedUser.id,
      methodId: method.id,
      provider: method.provider,
      amount: refreshedInvoice.amount,
    })

    void invoice
    setOperationStatus('Paiement simulé enregistré.')
  }

  const handleIssueLicense = () => {
    const targetOrg = snapshot.organizations[0]

    const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    business.issueLicense({
      ownerType: 'organization',
      ownerId: targetOrg.id,
      planName: 'Business',
      seats: 50,
      expiresAt: expiry,
    })
    setOperationStatus('Licence Business émise pour 50 sièges.')
  }

  const handleToggleFlag = (key: FeatureFlagKey, enabled: boolean) => {
    business.toggleFeatureFlag(selectedUser.id, key, enabled)
    setOperationStatus(`Feature flag ${key} mis à jour.`)
  }

  const handleDisconnectSession = (sessionId: string) => {
    const ok = business.logoutSession(sessionId)
    setOperationStatus(ok ? `Session ${sessionId} déconnectée.` : `Session ${sessionId} introuvable.`)
  }

  const toggleSessionSelection = (sessionId: string, checked: boolean) => {
    setSelectedSessionIds((current) => {
      if (checked) {
        return current.includes(sessionId) ? current : [...current, sessionId]
      }
      return current.filter((id) => id !== sessionId)
    })
  }

  const toggleSessionPageSelection = (checked: boolean) => {
    const protectedSessionId = business.currentSession?.sessionId
    const selectable = paginatedSessions
      .map((session) => session.sessionId)
      .filter((sessionId) => sessionId !== protectedSessionId)

    setSelectedSessionIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...selectable]))
      }
      const toRemove = new Set(selectable)
      return current.filter((id) => !toRemove.has(id))
    })
  }

  const revokeSelectedSessions = () => {
    const protectedSessionId = business.currentSession?.sessionId
    const target = selectedSessionIds.filter((sessionId) => sessionId !== protectedSessionId)
    if (target.length === 0) {
      setOperationStatus('Aucune session sélectionnée pour révocation.')
      return
    }

    const revoked = business.revokeUserSessions(selectedUser.id, target)
    setSelectedSessionIds([])
    setOperationStatus(`${revoked} session(s) révoquée(s) en action groupée.`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="Business Foundation & Identity System: gouvernance, identité, finances et accès SRG."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {[
          { label: 'Users', value: adminCounts.users },
          { label: 'Organizations', value: adminCounts.organizations },
          { label: 'Wallets', value: adminCounts.wallets },
          { label: 'Credits', value: adminCounts.credits },
          { label: 'Subscriptions', value: adminCounts.subscriptions },
          { label: 'Payments', value: adminCounts.payments },
        ].map((card) => (
          <div key={card.label} className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{card.value}</p>
          </div>
        ))}
      </div>

      <Section title="Admin Spaces" description="Users, Organizations, Licenses, Credits, Wallets, Subscriptions, Payments, Billing, Roles, Permissions.">
        <div className="flex flex-wrap gap-2">
          {ADMIN_SPACES.map((space) => (
            <button
              key={space}
              type="button"
              onClick={() => setActiveSpace(space)}
              className={`rounded-3xl px-4 py-2 text-sm font-semibold transition ${
                activeSpace === space
                  ? 'bg-[var(--lagoon-deep)] text-white'
                  : 'border border-[var(--line)] bg-[var(--surface-strong)] text-[var(--sea-ink)] hover:border-[var(--lagoon)]'
              }`}
            >
              {space}
            </button>
          ))}
        </div>
      </Section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Section title="Identity System" description="UUID interne, matricule SRG, username, téléphone obligatoire, email facultatif.">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Username</span>
                <input value={username} onChange={(event) => setUsername(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Téléphone (obligatoire)</span>
                <input value={phone} onChange={(event) => setPhone(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Email (facultatif)</span>
                <input value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Mot de passe</span>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Nom</span>
                <input value={lastName} onChange={(event) => setLastName(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Prénom</span>
                <input value={firstName} onChange={(event) => setFirstName(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Rôle</span>
                <select value={role} onChange={(event) => setRole(event.target.value as UserRole)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3">
                  {roleOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Langue</span>
                <input value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Pays</span>
                <input value={country} onChange={(event) => setCountry(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Ville</span>
                <input value={city} onChange={(event) => setCity(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Fuseau horaire</span>
                <input value={timezone} onChange={(event) => setTimezone(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
            </div>

            <button type="button" onClick={handleCreateUser} className="mt-4 rounded-3xl bg-[var(--lagoon-deep)] px-5 py-3 text-sm font-semibold text-white">
              Créer utilisateur
            </button>

            <div className="mt-5 space-y-3">
              {snapshot.users.slice(0, 6).map((user) => (
                <div key={user.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--sea-ink-soft)]">
                  <p className="font-semibold text-[var(--sea-ink)]">{user.username} · {user.role}</p>
                  <p className="mt-1">Matricule: {user.matricule}</p>
                  <p>Téléphone: {user.phone}</p>
                  <p>Email: {user.email ?? 'N/A'}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Authentication" description="Connexion Username/Matricule + Password, Forgot Password, Reset Password, OTP futur prêt.">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Identifier (username ou matricule)</span>
                <input value={authIdentifier} onChange={(event) => setAuthIdentifier(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Password</span>
                <input type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
            </div>
            <button type="button" onClick={handleAuthenticate} className="mt-4 rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--sea-ink)]">
              Tester connexion
            </button>
            {authResult ? <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">{authResult}</p> : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Forgot Password (identifier)</span>
                <input value={forgotIdentifier} onChange={(event) => setForgotIdentifier(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
              <button type="button" onClick={handleForgotPassword} className="self-end rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--sea-ink)]">
                Générer ticket reset
              </button>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Reset Ticket ID</span>
                <input value={resetTicketId} onChange={(event) => setResetTicketId(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Nouveau password</span>
                <input type="password" value={resetPassword} onChange={(event) => setResetPasswordValue(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
            </div>
            <button type="button" onClick={handleResetPassword} className="mt-4 rounded-3xl bg-[var(--lagoon-deep)] px-5 py-3 text-sm font-semibold text-white">
              Reset password
            </button>
          </Section>

          <Section title="Organizations" description="Entreprise, département, équipe et affectation utilisateur.">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Nom organisation</span>
                <input value={orgName} onChange={(event) => setOrgName(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Raison sociale</span>
                <input value={orgLegalName} onChange={(event) => setOrgLegalName(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Pays</span>
                <input value={orgCountry} onChange={(event) => setOrgCountry(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[var(--sea-ink)]">Ville</span>
                <input value={orgCity} onChange={(event) => setOrgCity(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3" />
              </label>
            </div>
            <button type="button" onClick={handleCreateOrganization} className="mt-4 rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--sea-ink)]">
              Créer organisation
            </button>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {snapshot.organizations.map((organization) => (
                <article key={organization.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-sm">
                  <p className="font-semibold text-[var(--sea-ink)]">{organization.name}</p>
                  <p className="text-[var(--sea-ink-soft)]">{organization.legalName}</p>
                  <p className="mt-1 text-[var(--sea-ink-soft)]">{organization.city}, {organization.country}</p>
                </article>
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Roles & Permissions" description="Rôles standards SRG et permissions préparées.">
            <div className="space-y-3">
              {snapshot.roles.map((roleItem) => (
                <div key={roleItem.role} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-sm">
                  <p className="font-semibold text-[var(--sea-ink)]">{roleItem.role}</p>
                  <p className="mt-2 text-[var(--sea-ink-soft)]">{roleItem.permissions.join(', ') || 'Aucune permission'}</p>
                  <button
                    type="button"
                    onClick={() => {
                      business.setUserRole(selectedUser.id, roleItem.role)
                      setOperationStatus(`Rôle ${roleItem.role} assigné à ${selectedUser.username}.`)
                    }}
                    className="mt-3 rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--sea-ink)]"
                  >
                    Assigner à {selectedUser.username}
                  </button>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Wallet & Credits" description="Recharge, bonus, réservation, consommation et remboursement de crédits.">
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={handleWalletRecharge} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Recharge +100</button>
              <button type="button" onClick={handleWalletBonus} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Bonus +25</button>
              <button type="button" onClick={handleReserveCredit} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Réserver 10 crédits</button>
              <button type="button" onClick={handleRefundCredit} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Rembourser 5 crédits</button>
            </div>

            <div className="mt-4 space-y-2 text-sm text-[var(--sea-ink-soft)]">
              {snapshot.creditAccounts.slice(0, 3).map((account) => (
                <p key={account.id}>User {account.userId}: disponible {account.available} · réservé {account.reserved} · consommé {account.consumed}</p>
              ))}
            </div>
          </Section>

          <Section title="Subscriptions, Billing, Licenses" description="Modèles d’abonnement, facturation, paiements simulés et licences.">
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={handleCreateSubscription} className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Activer Professional</button>
              <button type="button" onClick={handleCreateInvoiceAndPayment} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Créer facture + paiement</button>
              <button type="button" onClick={handleIssueLicense} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Émettre licence</button>
            </div>

            <div className="mt-4 space-y-2 text-sm text-[var(--sea-ink-soft)]">
              <p>Plans: {snapshot.subscriptionPlans.map((plan) => plan.name).join(', ')}</p>
              <p>Providers de paiement (abstraction): Stripe, Flutterwave, PayPal, CinetPay, Orange Money, MTN Mobile Money</p>
              <p>Invoices: {snapshot.invoices.length} · Payments: {snapshot.payments.length} · Licenses: {snapshot.licenses.length}</p>
            </div>
          </Section>

          <Section title="Feature Flags" description="Activation progressive des capacités produit.">
            <div className="grid gap-3 sm:grid-cols-2">
              {flagKeys.map((flag) => {
                const enabled = snapshot.featureFlagsByUser[selectedUser.id][flag]
                return (
                  <label key={flag} className="inline-flex items-center gap-2 rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink)]">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(event) => handleToggleFlag(flag, event.target.checked)}
                      aria-label={`Feature flag ${flag}`}
                    />
                    <span>{flag}</span>
                  </label>
                )
              })}
            </div>
          </Section>

          <Section title="Observability" description="Logs, metrics, events, traces pour toutes les opérations métier.">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                <p className="font-semibold text-[var(--sea-ink)]">Logs</p>
                <ul className="mt-2 space-y-1 text-xs text-[var(--sea-ink-soft)]">
                  {latestLogs.map((item) => (
                    <li key={item.id}>{item.operation} · {item.message}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                <p className="font-semibold text-[var(--sea-ink)]">Metrics</p>
                <ul className="mt-2 space-y-1 text-xs text-[var(--sea-ink-soft)]">
                  {latestMetrics.map((item) => (
                    <li key={item.id}>{item.name} = {item.value}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                <p className="font-semibold text-[var(--sea-ink)]">Events</p>
                <ul className="mt-2 space-y-1 text-xs text-[var(--sea-ink-soft)]">
                  {latestEvents.map((item) => (
                    <li key={item.id}>{item.type}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                <p className="font-semibold text-[var(--sea-ink)]">Traces</p>
                <ul className="mt-2 space-y-1 text-xs text-[var(--sea-ink-soft)]">
                  {latestTraces.map((item) => (
                    <li key={item.id}>{item.operation} · {item.status}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section title="Sessions" description="Recherche, filtres, tri, pagination, export et actions groupées.">
            <div className="grid gap-3 md:grid-cols-3">
              <input
                value={sessionQuery}
                onChange={(event) => {
                  setSessionQuery(event.target.value)
                  setSessionPage(1)
                }}
                placeholder="Recherche session, appareil, user agent, IP"
                className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm"
              />
              <select
                value={sessionStateFilter}
                onChange={(event) => {
                  setSessionStateFilter(event.target.value as 'all' | 'active' | 'closed')
                  setSessionPage(1)
                }}
                className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actives</option>
                <option value="closed">Fermées</option>
              </select>
              <select
                value={sessionSort}
                onChange={(event) => setSessionSort(event.target.value as 'lastActivityDesc' | 'createdDesc' | 'deviceAsc')}
                className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm"
              >
                <option value="lastActivityDesc">Tri: activité récente</option>
                <option value="createdDesc">Tri: création récente</option>
                <option value="deviceAsc">Tri: appareil A-Z</option>
              </select>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={exportSessionsCsv} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[var(--sea-ink)]">
                Export CSV
              </button>
              <label className="inline-flex items-center gap-2 rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-xs text-[var(--sea-ink)]">
                <input
                  type="checkbox"
                  checked={
                    paginatedSessions.filter((session) => session.sessionId !== business.currentSession?.sessionId).length > 0 &&
                    paginatedSessions
                      .filter((session) => session.sessionId !== business.currentSession?.sessionId)
                      .every((session) => selectedSessionIds.includes(session.sessionId))
                  }
                  onChange={(event) => toggleSessionPageSelection(event.target.checked)}
                />
                <span>Sélectionner la page</span>
              </label>
              <button type="button" onClick={revokeSelectedSessions} className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-xs font-semibold text-white">
                Révoquer sélection ({selectedSessionIds.length})
              </button>
            </div>

            <div className="mt-3 space-y-3 text-sm">
              {paginatedSessions.length === 0 ? (
                <p className="text-[var(--sea-ink-soft)]">Aucune session trouvée.</p>
              ) : null}
              {paginatedSessions.map((session) => {
                const [browser, os] = (session.userAgent ?? 'Unknown Browser / Unknown OS').split(' / ')
                const isCurrent = session.sessionId === business.currentSession?.sessionId

                return (
                  <article key={session.sessionId} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-[var(--sea-ink)]">
                        {session.deviceName} {isCurrent ? '(device courant)' : ''}
                      </p>
                      <label className="inline-flex items-center gap-2 text-xs text-[var(--sea-ink-soft)]">
                        <input
                          type="checkbox"
                          disabled={isCurrent}
                          checked={selectedSessionIds.includes(session.sessionId)}
                          onChange={(event) => toggleSessionSelection(session.sessionId, event.target.checked)}
                        />
                        <span>{isCurrent ? 'Protégée' : 'Sélection'}</span>
                      </label>
                    </div>
                    <p className="text-[var(--sea-ink-soft)]">Session: {session.sessionId}</p>
                    <p className="text-[var(--sea-ink-soft)]">Navigateur: {browser} · OS: {os || 'Unknown OS'}</p>
                    <p className="text-[var(--sea-ink-soft)]">IP: {session.ipAddress ?? '0.0.0.0'} · Trusted: {session.rememberMe ? 'yes' : 'no'}</p>
                    <p className="text-[var(--sea-ink-soft)]">Créée: {new Date(session.createdAt).toLocaleString()} · Dernière activité: {new Date(session.lastActivityAt).toLocaleString()}</p>
                    <p className="text-[var(--sea-ink-soft)]">Statut: {session.active ? 'active' : 'closed'} · Expire: {new Date(session.expiresAt).toLocaleString()}</p>
                    <button
                      type="button"
                      onClick={() => handleDisconnectSession(session.sessionId)}
                      className="mt-3 rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--sea-ink)]"
                    >
                      Déconnecter
                    </button>
                  </article>
                )
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-[var(--sea-ink-soft)]">
              <span>Page {sessionCurrentPage} / {sessionTotalPages}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={sessionCurrentPage <= 1}
                  onClick={() => setSessionPage((current) => Math.max(1, current - 1))}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-1 disabled:opacity-50"
                >
                  Précédente
                </button>
                <button
                  type="button"
                  disabled={sessionCurrentPage >= sessionTotalPages}
                  onClick={() => setSessionPage((current) => Math.min(sessionTotalPages, current + 1))}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-1 disabled:opacity-50"
                >
                  Suivante
                </button>
              </div>
            </div>
          </Section>

          <Section title="Sécurité" description="Filtres date/type/statut/utilisateur/appareil avec export JSON.">
            <div className="grid gap-3 md:grid-cols-3">
              <input
                value={securityQuery}
                onChange={(event) => {
                  setSecurityQuery(event.target.value)
                  setSecurityPage(1)
                }}
                placeholder="Recherche type, message, user, appareil, IP"
                className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm"
              />
              <select
                value={securityTypeFilter}
                onChange={(event) => {
                  setSecurityTypeFilter(event.target.value)
                  setSecurityPage(1)
                }}
                className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm"
              >
                {securityTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={securityStatusFilter}
                onChange={(event) => {
                  setSecurityStatusFilter(event.target.value as 'all' | 'success' | 'failed')
                  setSecurityPage(1)
                }}
                className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm"
              >
                <option value="all">Tous statuts</option>
                <option value="success">success</option>
                <option value="failed">failed</option>
              </select>
              <label className="grid gap-1 text-xs text-[var(--sea-ink-soft)]">
                <span>Du</span>
                <input
                  type="date"
                  value={securityDateFrom}
                  onChange={(event) => {
                    setSecurityDateFrom(event.target.value)
                    setSecurityPage(1)
                  }}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm"
                />
              </label>
              <label className="grid gap-1 text-xs text-[var(--sea-ink-soft)]">
                <span>Au</span>
                <input
                  type="date"
                  value={securityDateTo}
                  onChange={(event) => {
                    setSecurityDateTo(event.target.value)
                    setSecurityPage(1)
                  }}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm"
                />
              </label>
              <select
                value={securitySort}
                onChange={(event) => setSecuritySort(event.target.value as 'dateDesc' | 'dateAsc' | 'typeAsc')}
                className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm"
              >
                <option value="dateDesc">Tri: date desc</option>
                <option value="dateAsc">Tri: date asc</option>
                <option value="typeAsc">Tri: type A-Z</option>
              </select>
            </div>

            <div className="mt-3">
              <button type="button" onClick={exportSecurityJson} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[var(--sea-ink)]">
                Export JSON
              </button>
            </div>

            <div className="mt-3 space-y-2 text-sm">
              {paginatedSecurityEvents.length === 0 ? (
                <p className="text-[var(--sea-ink-soft)]">Aucun événement de sécurité trouvé.</p>
              ) : null}
              {paginatedSecurityEvents.map((event) => (
                <div key={event.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">
                  <p className="font-semibold text-[var(--sea-ink)]">{event.type} ({event.status})</p>
                  <p className="text-[var(--sea-ink-soft)]">{event.message}</p>
                  <p className="text-[var(--sea-ink-soft)]">User: {event.userId ?? 'N/A'} · Device: {String(event.metadata?.deviceName ?? 'N/A')}</p>
                  <p className="text-[var(--sea-ink-soft)]">IP: {String(event.metadata?.ipAddress ?? 'N/A')} · {new Date(event.at).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-[var(--sea-ink-soft)]">
              <span>Page {securityCurrentPage} / {securityTotalPages}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={securityCurrentPage <= 1}
                  onClick={() => setSecurityPage((current) => Math.max(1, current - 1))}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-1 disabled:opacity-50"
                >
                  Précédente
                </button>
                <button
                  type="button"
                  disabled={securityCurrentPage >= securityTotalPages}
                  onClick={() => setSecurityPage((current) => Math.min(securityTotalPages, current + 1))}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-1 disabled:opacity-50"
                >
                  Suivante
                </button>
              </div>
            </div>
          </Section>
        </div>
      </div>

      <Section title="Active Space" description="Espace d’administration actuellement sélectionné.">
        <p className="text-sm text-[var(--sea-ink-soft)]">Espace actif: <span className="font-semibold text-[var(--sea-ink)]">{activeSpace}</span></p>
        {operationStatus ? <p className="mt-2 text-sm text-[var(--sea-ink-soft)]" role="status">{operationStatus}</p> : null}
      </Section>
    </div>
  )
}
