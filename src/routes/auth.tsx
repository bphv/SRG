import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import { useBusiness } from '#/app/hooks/useBusiness'
import type { OtpProviderName } from '#/business/identity'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

type Step = 1 | 2 | 3 | 4

function AuthPage() {
  const business = useBusiness()
  const navigate = useNavigate({ from: '/auth' })

  const [step, setStep] = useState<Step>(1)
  const [personal, setPersonal] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    email: '',
    country: 'France',
    city: 'Paris',
    language: 'Français',
  })
  const [company, setCompany] = useState({
    company: '',
    department: '',
    jobTitle: '',
    companySize: '1-10' as '1-10' | '11-50' | '51-200' | '201-1000' | '1000+',
  })
  const [security, setSecurity] = useState({
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false,
  })

  const [registerStatus, setRegisterStatus] = useState('')
  const [createdIdentity, setCreatedIdentity] = useState<{ matricule: string; username: string } | null>(null)
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false)
  const [step1Attempted, setStep1Attempted] = useState(false)
  const [step3Attempted, setStep3Attempted] = useState(false)

  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loginSessionId, setLoginSessionId] = useState<string | null>(null)
  const [loginStatus, setLoginStatus] = useState('')

  const [otpPhone, setOtpPhone] = useState('')
  const [otpProvider, setOtpProvider] = useState<OtpProviderName>('Twilio')
  const [otpSessionId, setOtpSessionId] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [forgotStatus, setForgotStatus] = useState('')
  const [sandboxCode, setSandboxCode] = useState('')

  const step1Validation = useMemo(() => business.validateRegistrationStep1(personal), [business, personal])
  const step3Validation = useMemo(() => business.validateRegistrationStep3(security), [business, security])

  const activeUserId =
    (createdIdentity
      ? business.snapshot.users.find(
          (user) => user.username === createdIdentity.username && user.matricule === createdIdentity.matricule,
        )?.id
      : undefined) ||
    business.snapshot.users.at(0)?.id ||
    ''
  const sessionHistory = activeUserId ? business.getSessionHistory(activeUserId) : []

  const nextStep = () => {
    if (step === 1 && !step1Validation.isValid) {
      setStep1Attempted(true)
      setRegisterStatus('Veuillez corriger les erreurs de l\'étape 1.')
      return
    }
    if (step === 3 && !step3Validation.isValid) {
      setStep3Attempted(true)
      setRegisterStatus('Veuillez corriger les erreurs de sécurité.')
      return
    }
    setRegisterStatus('')
    setStep((current) => (current < 4 ? ((current + 1) as Step) : current))
  }

  const previousStep = () => {
    setStep((current) => (current > 1 ? ((current - 1) as Step) : current))
  }

  const submitRegistration = () => {
    if (isSubmittingRegistration) return
    setIsSubmittingRegistration(true)

    try {
      const user = business.registerAccount({
        personal,
        company,
        security,
      })

      setCreatedIdentity({ matricule: user.matricule, username: user.username })

      const loginResult = business.loginWithSession(user.username, security.password, {
        rememberMe: true,
        device: {
          deviceName: 'Web Browser',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        },
      })

      if (!loginResult.success) {
        setRegisterStatus(`Compte créé avec succès. Matricule: ${user.matricule}. Connexion automatique échouée.`)
        return
      }

      setLoginSessionId(loginResult.sessionId ?? null)
      if (loginResult.requiresApproval) {
        const status = loginResult.accountStatus ?? 'PENDING_APPROVAL'
        setLoginStatus(`Compte créé. Statut: ${status}. En attente de validation administrateur.`)
        setRegisterStatus(`Compte créé avec succès. Matricule: ${user.matricule}. Votre compte est en attente d'approbation.`)
        navigate({ to: '/account-pending', search: { status } })
        return
      }

      setLoginStatus(`Connexion réussie. Session: ${loginResult.sessionId}`)
      setRegisterStatus(`Compte créé avec succès. Matricule: ${user.matricule}. Redirection vers l'espace Categories...`)
      navigate({ to: '/categories' })
    } catch (error) {
      setRegisterStatus(error instanceof Error ? error.message : 'Échec de création du compte.')
    } finally {
      setIsSubmittingRegistration(false)
    }
  }

  const handleLogin = () => {
    const result = business.loginWithSession(loginIdentifier, loginPassword, {
      rememberMe,
      device: {
        deviceName: 'Web Browser',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      },
    })

    if (!result.success || !result.sessionId) {
      setLoginStatus(`Connexion échouée: ${result.reason ?? 'unknown'}`)
      return
    }

    if (result.requiresApproval) {
      const status = result.accountStatus ?? 'PENDING_APPROVAL'
      setLoginStatus(`Compte authentifié mais accès restreint: ${status}. Validation administrateur requise.`)
      navigate({ to: '/account-pending', search: { status } })
      return
    }

    setLoginSessionId(result.sessionId)
    setLoginStatus(`Connexion réussie. Session: ${result.sessionId}`)
  }

  const handleLogoutCurrent = () => {
    if (!loginSessionId) {
      setLoginStatus('Aucune session active locale.')
      return
    }

    const ok = business.logoutSession(loginSessionId)
    setLoginStatus(ok ? 'Session déconnectée.' : 'Session introuvable.')
    if (ok) {
      setLoginSessionId(null)
    }
  }

  const handleLogoutAll = () => {
    if (!activeUserId) {
      setLoginStatus('Aucun utilisateur ciblé pour logout global.')
      return
    }

    const revoked = business.logoutAllUserSessions(activeUserId, loginSessionId ?? undefined)
    setLoginStatus(`${revoked} session(s) déconnectée(s) sur les autres appareils.`)
  }

  const startOtpReset = () => {
    try {
      const challenge = business.startForgotPasswordByPhone(otpPhone, otpProvider)
      setOtpSessionId(challenge.sessionId)
      setSandboxCode(challenge.sandboxCode ?? '')
      setForgotStatus(`OTP envoyé via ${challenge.provider}. Expire à ${new Date(challenge.expiresAt).toLocaleTimeString()}.`)
    } catch (error) {
      setForgotStatus(error instanceof Error ? error.message : 'Impossible de lancer le reset.')
    }
  }

  const verifyOtp = () => {
    const ok = business.verifyForgotPasswordOtp(otpSessionId, otpCode)
    setForgotStatus(ok ? 'OTP vérifié avec succès.' : 'OTP invalide ou expiré.')
  }

  const finalizeReset = () => {
    try {
      business.resetPasswordWithOtp(otpSessionId, newPassword)
      setForgotStatus('Mot de passe réinitialisé. Vous pouvez vous connecter.')
      setOtpCode('')
      setNewPassword('')
    } catch (error) {
      setForgotStatus(error instanceof Error ? error.message : 'Échec de réinitialisation.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authentication & Account Management"
        description="Inscription 4 étapes, login Username/Matricule, OTP reset, sessions et gestion appareils."
      />

      <Section title="Inscription (4 étapes)" description="Création de compte SRG avec identité, wallet, credits et plan automatique.">
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          {[1, 2, 3, 4].map((index) => (
            <span
              key={index}
              className={`rounded-full px-3 py-1 font-semibold ${step === index ? 'bg-[var(--srg-color-primary-500)] text-white' : 'bg-[var(--srg-surface-strong)] text-[var(--srg-text-muted)]'}`}
            >
              Étape {index}
            </span>
          ))}
        </div>

        {step === 1 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm"><span>Nom</span><input value={personal.lastName} onChange={(event) => setPersonal((current) => ({ ...current, lastName: event.target.value }))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />{step1Attempted && !step1Validation.lastName.valid ? <span className="text-xs text-[#9b2f2f]">{step1Validation.lastName.message}</span> : null}</label>
            <label className="grid gap-1 text-sm"><span>Prénom</span><input value={personal.firstName} onChange={(event) => setPersonal((current) => ({ ...current, firstName: event.target.value }))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />{step1Attempted && !step1Validation.firstName.valid ? <span className="text-xs text-[#9b2f2f]">{step1Validation.firstName.message}</span> : null}</label>
            <label className="grid gap-1 text-sm"><span>Username</span><input value={personal.username} onChange={(event) => setPersonal((current) => ({ ...current, username: event.target.value }))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />{step1Attempted && !step1Validation.username.valid ? <span className="text-xs text-[#9b2f2f]">{step1Validation.username.message}</span> : null}</label>
            <label className="grid gap-1 text-sm"><span>Téléphone</span><input value={personal.phone} onChange={(event) => setPersonal((current) => ({ ...current, phone: event.target.value }))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />{step1Attempted && !step1Validation.phone.valid ? <span className="text-xs text-[#9b2f2f]">{step1Validation.phone.message}</span> : null}</label>
            <label className="grid gap-1 text-sm"><span>Email (facultatif)</span><input value={personal.email} onChange={(event) => setPersonal((current) => ({ ...current, email: event.target.value }))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />{step1Attempted && !step1Validation.email.valid ? <span className="text-xs text-[#9b2f2f]">{step1Validation.email.message}</span> : null}</label>
            <label className="grid gap-1 text-sm"><span>Pays</span><input value={personal.country} onChange={(event) => setPersonal((current) => ({ ...current, country: event.target.value }))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />{step1Attempted && !step1Validation.country.valid ? <span className="text-xs text-[#9b2f2f]">{step1Validation.country.message}</span> : null}</label>
            <label className="grid gap-1 text-sm"><span>Ville</span><input value={personal.city} onChange={(event) => setPersonal((current) => ({ ...current, city: event.target.value }))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />{step1Attempted && !step1Validation.city.valid ? <span className="text-xs text-[#9b2f2f]">{step1Validation.city.message}</span> : null}</label>
            <label className="grid gap-1 text-sm"><span>Langue</span><input value={personal.language} onChange={(event) => setPersonal((current) => ({ ...current, language: event.target.value }))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />{step1Attempted && !step1Validation.language.valid ? <span className="text-xs text-[#9b2f2f]">{step1Validation.language.message}</span> : null}</label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm"><span>Société (facultatif)</span><input value={company.company} onChange={(event) => setCompany((current) => ({ ...current, company: event.target.value }))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" /></label>
            <label className="grid gap-1 text-sm"><span>Département</span><input value={company.department} onChange={(event) => setCompany((current) => ({ ...current, department: event.target.value }))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" /></label>
            <label className="grid gap-1 text-sm"><span>Fonction</span><input value={company.jobTitle} onChange={(event) => setCompany((current) => ({ ...current, jobTitle: event.target.value }))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" /></label>
            <label className="grid gap-1 text-sm"><span>Taille entreprise</span>
              <select value={company.companySize} onChange={(event) => setCompany((current) => ({ ...current, companySize: event.target.value as typeof current.companySize }))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-1000">201-1000</option>
                <option value="1000+">1000+</option>
              </select>
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm"><span>Mot de passe</span><input type="password" value={security.password} onChange={(event) => setSecurity((current) => ({ ...current, password: event.target.value }))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />{step3Attempted && !step3Validation.password.valid ? <span className="text-xs text-[#9b2f2f]">{step3Validation.password.message}</span> : null}</label>
            <label className="grid gap-1 text-sm"><span>Confirmation</span><input type="password" value={security.confirmPassword} onChange={(event) => setSecurity((current) => ({ ...current, confirmPassword: event.target.value }))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />{step3Attempted && !step3Validation.confirmPassword.valid ? <span className="text-xs text-[#9b2f2f]">{step3Validation.confirmPassword.message}</span> : null}</label>
            <div className="md:col-span-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3 text-sm">
              Force du mot de passe: <strong>{step3Validation.strength}</strong>
            </div>
            <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" checked={security.acceptTerms} onChange={(event) => setSecurity((current) => ({ ...current, acceptTerms: event.target.checked }))} />
              <span>J'accepte les conditions générales</span>
            </label>
            {step3Attempted && !step3Validation.acceptTerms.valid ? <span className="md:col-span-2 text-xs text-[#9b2f2f]">{step3Validation.acceptTerms.message}</span> : null}
            <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" checked={security.acceptPrivacy} onChange={(event) => setSecurity((current) => ({ ...current, acceptPrivacy: event.target.checked }))} />
              <span>J'accepte la politique de confidentialité</span>
            </label>
            {step3Attempted && !step3Validation.acceptPrivacy.valid ? <span className="md:col-span-2 text-xs text-[#9b2f2f]">{step3Validation.acceptPrivacy.message}</span> : null}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm">
            <p><strong>Nom complet:</strong> {personal.firstName} {personal.lastName}</p>
            <p><strong>Username:</strong> {personal.username}</p>
            <p><strong>Téléphone:</strong> {personal.phone}</p>
            <p><strong>Email:</strong> {personal.email || '-'}</p>
            <p><strong>Localisation:</strong> {personal.city}, {personal.country}</p>
            <p><strong>Société:</strong> {company.company || '-'}</p>
            <p><strong>Département:</strong> {company.department || '-'}</p>
            <p><strong>Fonction:</strong> {company.jobTitle || '-'}</p>
            <p><strong>Taille:</strong> {company.companySize}</p>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={previousStep} disabled={step === 1} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm disabled:opacity-50">Précédent</button>
          {step < 4 ? (
            <button type="button" onClick={nextStep} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Suivant</button>
          ) : (
            <button type="button" onClick={submitRegistration} disabled={isSubmittingRegistration} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{isSubmittingRegistration ? 'Création...' : 'Créer le compte'}</button>
          )}
        </div>

        {registerStatus ? <p className="mt-3 text-sm text-[var(--srg-text-muted)]">{registerStatus}</p> : null}
        {createdIdentity ? (
          <p className="mt-2 text-sm text-[var(--srg-text-muted)]">
            Votre compte SRG a été créé. Matricule: {createdIdentity.matricule}. Ce matricule peut être utilisé pour se connecter.
          </p>
        ) : null}
      </Section>

      <Section title="Login" description="Connexion par Username + Password ou Matricule + Password.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm"><span>Identifier</span><input value={loginIdentifier} onChange={(event) => setLoginIdentifier(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" /></label>
          <label className="grid gap-1 text-sm"><span>Password</span><input type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" /></label>
          <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
            <span>Remember me</span>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={handleLogin} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Se connecter</button>
          <button type="button" onClick={handleLogoutCurrent} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm">Logout</button>
          <button type="button" onClick={handleLogoutAll} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm">Logout all devices</button>
        </div>

        {loginStatus ? <p className="mt-3 text-sm text-[var(--srg-text-muted)]">{loginStatus}</p> : null}
      </Section>

      <Section title="Mot de passe oublié" description="Workflow Téléphone → OTP → Nouveau mot de passe → Connexion.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm"><span>Téléphone</span><input value={otpPhone} onChange={(event) => setOtpPhone(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" /></label>
          <label className="grid gap-1 text-sm"><span>Provider OTP</span>
            <select value={otpProvider} onChange={(event) => setOtpProvider(event.target.value as OtpProviderName)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">
              <option value="Twilio">Twilio</option>
              <option value="Vonage">Vonage</option>
              <option value="Orange SMS">Orange SMS</option>
              <option value="MTN SMS">MTN SMS</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm"><span>Session OTP</span><input value={otpSessionId} onChange={(event) => setOtpSessionId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" /></label>
          <label className="grid gap-1 text-sm"><span>Code OTP</span><input value={otpCode} onChange={(event) => setOtpCode(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" /></label>
          <label className="grid gap-1 text-sm md:col-span-2"><span>Nouveau mot de passe</span><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" /></label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={startOtpReset} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Envoyer OTP</button>
          <button type="button" onClick={verifyOtp} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm">Vérifier OTP</button>
          <button type="button" onClick={finalizeReset} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm">Réinitialiser</button>
        </div>

        {sandboxCode ? <p className="mt-2 text-xs text-[var(--srg-text-muted)]">Sandbox OTP code: {sandboxCode}</p> : null}
        {forgotStatus ? <p className="mt-2 text-sm text-[var(--srg-text-muted)]">{forgotStatus}</p> : null}
      </Section>

      <Section title="Session History" description="Historique des sessions et état des appareils.">
        <div className="space-y-2 text-sm">
          {sessionHistory.length === 0 ? <p className="text-[var(--srg-text-muted)]">Aucune session enregistrée.</p> : null}
          {sessionHistory.map((entry) => (
            <div key={entry.sessionId} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">
              <p><strong>{entry.deviceName}</strong> ({entry.active ? 'active' : 'closed'})</p>
              <p>Session: {entry.sessionId}</p>
              <p>Created: {new Date(entry.createdAt).toLocaleString()} | Last activity: {new Date(entry.lastActivityAt).toLocaleString()}</p>
              <p>Expires: {new Date(entry.expiresAt).toLocaleString()} | Remember me: {entry.rememberMe ? 'yes' : 'no'}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
