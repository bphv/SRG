import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useBusiness } from '#/app/hooks/useBusiness'
import type { OtpProviderName } from '#/business/identity'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

type Step = 1 | 2 | 3 | 4
type AuthMode = 'register' | 'login' | 'forgot'

const STEP_LABELS: Record<Step, string> = {
  1: 'Identite',
  2: 'Coordonnees',
  3: 'Securite',
  4: 'Confirmation',
}

const inputClass =
  'w-full rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2.5 text-sm text-[var(--srg-text-body)] outline-none transition-colors placeholder:text-[var(--srg-text-muted)] focus:border-[var(--srg-color-primary-500)] focus:ring-2 focus:ring-[rgba(79,184,178,0.2)]'

const primaryButtonClass =
  'inline-flex items-center justify-center rounded-xl bg-[var(--srg-color-primary-500)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'

const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-6 py-2.5 text-sm font-semibold text-[var(--srg-text-title)] transition-colors hover:bg-[var(--srg-surface-strong)] disabled:cursor-not-allowed disabled:opacity-50'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <span className="text-xs text-[#9b2f2f]">{message}</span>
}

function AuthStepper({ step }: { step: Step }) {
  return (
    <div>
      {/* Stepper desktop : 4 etapes visibles */}
      <ol className="hidden items-center gap-2 sm:flex" aria-label="Progression de l'inscription">
        {([1, 2, 3, 4] as Step[]).map((index) => {
          const isActive = step === index
          const isDone = step > index
          return (
            <li key={index} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-[var(--srg-color-primary-500)] text-white'
                    : isDone
                      ? 'bg-[var(--srg-color-primary-500)]/20 text-[var(--srg-color-primary-500)]'
                      : 'bg-[var(--srg-surface-strong)] text-[var(--srg-text-muted)]'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isDone ? '✓' : index}
              </span>
              <span
                className={`hidden text-xs font-semibold md:block ${
                  isActive ? 'text-[var(--srg-text-title)]' : 'text-[var(--srg-text-muted)]'
                }`}
              >
                {STEP_LABELS[index]}
              </span>
            </li>
          )
        })}
      </ol>

      {/* Stepper mobile : compact */}
      <div className="sm:hidden">
        <p className="text-xs font-semibold text-[var(--srg-text-title)]">
          Etape {step} sur 4 — {STEP_LABELS[step]}
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--srg-surface-strong)]">
          <div
            className="h-full rounded-full bg-[var(--srg-color-primary-500)] transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function AuthPage() {
  const business = useBusiness()
  const navigate = useNavigate({ from: '/auth' })

  const [mode, setMode] = useState<AuthMode>('register')
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
  const [loginStatus, setLoginStatus] = useState('')

  const [otpPhone, setOtpPhone] = useState('')
  const [otpProvider] = useState<OtpProviderName>('Twilio')
  const [otpSessionId, setOtpSessionId] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [forgotStatus, setForgotStatus] = useState('')
  const [sandboxCode, setSandboxCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)

  const step1Validation = useMemo(() => business.validateRegistrationStep1(personal), [business, personal])
  const step3Validation = useMemo(() => business.validateRegistrationStep3(security), [business, security])

  const nextStep = () => {
    if (step === 1 && !step1Validation.isValid) {
      setStep1Attempted(true)
      setRegisterStatus('Veuillez corriger les erreurs de l\'etape 1.')
      return
    }
    if (step === 3 && !step3Validation.isValid) {
      setStep3Attempted(true)
      setRegisterStatus('Veuillez corriger les erreurs de securite.')
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
        setRegisterStatus(`Compte cree avec succes. Matricule: ${user.matricule}. Connexion automatique echouee.`)
        return
      }

      if (loginResult.requiresApproval) {
        const status = loginResult.accountStatus ?? 'PENDING_APPROVAL'
        setLoginStatus(`Compte cree. Statut: ${status}. En attente de validation administrateur.`)
        setRegisterStatus(`Compte cree avec succes. Matricule: ${user.matricule}. Votre compte est en attente d'approbation.`)
        navigate({ to: '/account-pending', search: { status } })
        return
      }

      setLoginStatus(`Connexion reussie. Session: ${loginResult.sessionId}`)
      setRegisterStatus(`Compte cree avec succes. Matricule: ${user.matricule}. Redirection vers l'espace Categories...`)
      navigate({ to: '/categories' })
    } catch (error) {
      setRegisterStatus(error instanceof Error ? error.message : 'Echec de creation du compte.')
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
      setLoginStatus(`Connexion echouee: ${result.reason ?? 'unknown'}`)
      return
    }

    if (result.requiresApproval) {
      const status = result.accountStatus ?? 'PENDING_APPROVAL'
      setLoginStatus(`Compte authentifie mais acces restreint: ${status}. Validation administrateur requise.`)
      navigate({ to: '/account-pending', search: { status } })
      return
    }

    setLoginStatus(`Connexion reussie. Session: ${result.sessionId}`)
    navigate({ to: '/categories' })
  }

  const startOtpReset = () => {
    try {
      const challenge = business.startForgotPasswordByPhone(otpPhone, otpProvider)
      setOtpSessionId(challenge.sessionId)
      setSandboxCode(challenge.sandboxCode ?? '')
      setOtpSent(true)
      setForgotStatus(`Code de verification envoye. Expire a ${new Date(challenge.expiresAt).toLocaleTimeString()}.`)
    } catch (error) {
      setForgotStatus(error instanceof Error ? error.message : 'Impossible de lancer le reset.')
    }
  }

  const verifyOtp = () => {
    const ok = business.verifyForgotPasswordOtp(otpSessionId, otpCode)
    setOtpVerified(ok)
    setForgotStatus(ok ? 'Code verifie avec succes.' : 'Code invalide ou expire.')
  }

  const finalizeReset = () => {
    try {
      business.resetPasswordWithOtp(otpSessionId, newPassword)
      setForgotStatus('Mot de passe reinitialise. Vous pouvez vous connecter.')
      setOtpCode('')
      setNewPassword('')
      setOtpSent(false)
      setOtpVerified(false)
    } catch (error) {
      setForgotStatus(error instanceof Error ? error.message : 'Echec de reinitialisation.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Titre principal */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--srg-text-title)] md:text-3xl">
          {mode === 'register' ? 'Creer votre compte SRG' : mode === 'login' ? 'Connexion' : 'Mot de passe oublie'}
        </h1>
        <p className="mt-2 text-sm text-[var(--srg-text-muted)]">
          {mode === 'register'
            ? 'Votre compte vous donne acces a l\'espace SRG Enterprise Intelligence Platform.'
            : mode === 'login'
              ? 'Connectez-vous avec votre Username ou votre Matricule SRG.'
              : 'Entrez votre numero de telephone pour recevoir un code de verification.'}
        </p>
      </div>

      {/* Onglets Inscription / Connexion */}
      <div className="flex rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-1" role="tablist" aria-label="Mode d'authentification">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'register'}
          onClick={() => setMode('register')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            mode === 'register'
              ? 'bg-[var(--srg-surface)] text-[var(--srg-text-title)] shadow-sm'
              : 'text-[var(--srg-text-muted)] hover:text-[var(--srg-text-title)]'
          }`}
        >
          Inscription
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          onClick={() => setMode('login')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            mode === 'login'
              ? 'bg-[var(--srg-surface)] text-[var(--srg-text-title)] shadow-sm'
              : 'text-[var(--srg-text-muted)] hover:text-[var(--srg-text-title)]'
          }`}
        >
          Connexion
        </button>
      </div>

      {/* Carte principale */}
      <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-sm md:p-8">
        {/* ==================== INSCRIPTION ==================== */}
        {mode === 'register' ? (
          <div className="space-y-6">
            <AuthStepper step={step} />

            {step === 1 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-[var(--srg-text-title)]">Nom</span>
                  <input value={personal.lastName} onChange={(event) => setPersonal((current) => ({ ...current, lastName: event.target.value }))} className={inputClass} placeholder="Votre nom" />
                  {step1Attempted ? <FieldError message={step1Validation.lastName.valid ? undefined : step1Validation.lastName.message} /> : null}
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-[var(--srg-text-title)]">Prenom</span>
                  <input value={personal.firstName} onChange={(event) => setPersonal((current) => ({ ...current, firstName: event.target.value }))} className={inputClass} placeholder="Votre prenom" />
                  {step1Attempted ? <FieldError message={step1Validation.firstName.valid ? undefined : step1Validation.firstName.message} /> : null}
                </label>
                <label className="grid gap-1.5 text-sm md:col-span-2">
                  <span className="font-medium text-[var(--srg-text-title)]">Username</span>
                  <input value={personal.username} onChange={(event) => setPersonal((current) => ({ ...current, username: event.target.value }))} className={inputClass} placeholder="Identifiant unique" />
                  {step1Attempted ? <FieldError message={step1Validation.username.valid ? undefined : step1Validation.username.message} /> : null}
                </label>
                <label className="grid gap-1.5 text-sm md:col-span-2">
                  <span className="font-medium text-[var(--srg-text-title)]">Telephone</span>
                  <input value={personal.phone} onChange={(event) => setPersonal((current) => ({ ...current, phone: event.target.value }))} className={inputClass} placeholder="+33 6 12 34 56 78" />
                  {step1Attempted ? <FieldError message={step1Validation.phone.valid ? undefined : step1Validation.phone.message} /> : null}
                </label>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-[var(--srg-text-title)]">Email (facultatif)</span>
                  <input type="email" value={personal.email} onChange={(event) => setPersonal((current) => ({ ...current, email: event.target.value }))} className={inputClass} placeholder="vous@exemple.com" />
                  {step1Attempted ? <FieldError message={step1Validation.email.valid ? undefined : step1Validation.email.message} /> : null}
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-[var(--srg-text-title)]">Pays</span>
                  <input value={personal.country} onChange={(event) => setPersonal((current) => ({ ...current, country: event.target.value }))} className={inputClass} />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-[var(--srg-text-title)]">Ville</span>
                  <input value={personal.city} onChange={(event) => setPersonal((current) => ({ ...current, city: event.target.value }))} className={inputClass} />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-[var(--srg-text-title)]">Langue</span>
                  <input value={personal.language} onChange={(event) => setPersonal((current) => ({ ...current, language: event.target.value }))} className={inputClass} />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-[var(--srg-text-title)]">Societe (facultatif)</span>
                  <input value={company.company} onChange={(event) => setCompany((current) => ({ ...current, company: event.target.value }))} className={inputClass} />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-[var(--srg-text-title)]">Departement</span>
                  <input value={company.department} onChange={(event) => setCompany((current) => ({ ...current, department: event.target.value }))} className={inputClass} />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-[var(--srg-text-title)]">Fonction</span>
                  <input value={company.jobTitle} onChange={(event) => setCompany((current) => ({ ...current, jobTitle: event.target.value }))} className={inputClass} />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-[var(--srg-text-title)]">Taille entreprise</span>
                  <select value={company.companySize} onChange={(event) => setCompany((current) => ({ ...current, companySize: event.target.value as typeof current.companySize }))} className={inputClass}>
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
              <div className="grid gap-4">
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-[var(--srg-text-title)]">Mot de passe</span>
                  <input type="password" value={security.password} onChange={(event) => setSecurity((current) => ({ ...current, password: event.target.value }))} className={inputClass} placeholder="Mot de passe solide" />
                  {step3Attempted ? <FieldError message={step3Validation.password.valid ? undefined : step3Validation.password.message} /> : null}
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-[var(--srg-text-title)]">Confirmation du mot de passe</span>
                  <input type="password" value={security.confirmPassword} onChange={(event) => setSecurity((current) => ({ ...current, confirmPassword: event.target.value }))} className={inputClass} placeholder="Confirmez le mot de passe" />
                  {step3Attempted ? <FieldError message={step3Validation.confirmPassword.valid ? undefined : step3Validation.confirmPassword.message} /> : null}
                </label>
                <div className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm">
                  Force du mot de passe : <strong className="text-[var(--srg-text-title)]">{step3Validation.strength}</strong>
                </div>
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" checked={security.acceptTerms} onChange={(event) => setSecurity((current) => ({ ...current, acceptTerms: event.target.checked }))} className="mt-0.5 h-4 w-4 rounded border-[var(--srg-border)]" />
                  <span>J'accepte les <strong>conditions generales d'utilisation</strong></span>
                </label>
                {step3Attempted ? <FieldError message={step3Validation.acceptTerms.valid ? undefined : step3Validation.acceptTerms.message} /> : null}
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" checked={security.acceptPrivacy} onChange={(event) => setSecurity((current) => ({ ...current, acceptPrivacy: event.target.checked }))} className="mt-0.5 h-4 w-4 rounded border-[var(--srg-border)]" />
                  <span>J'accepte la <strong>politique de confidentialite</strong></span>
                </label>
                {step3Attempted ? <FieldError message={step3Validation.acceptPrivacy.valid ? undefined : step3Validation.acceptPrivacy.message} /> : null}
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm">
                  <h3 className="mb-3 font-semibold text-[var(--srg-text-title)]">Recapitulatif de votre compte</h3>
                  <dl className="grid gap-2">
                    <div className="flex justify-between gap-4"><dt className="text-[var(--srg-text-muted)]">Nom complet</dt><dd className="font-medium text-[var(--srg-text-title)]">{personal.firstName} {personal.lastName}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-[var(--srg-text-muted)]">Username</dt><dd className="font-medium text-[var(--srg-text-title)]">{personal.username}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-[var(--srg-text-muted)]">Telephone</dt><dd className="font-medium text-[var(--srg-text-title)]">{personal.phone}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-[var(--srg-text-muted)]">Email</dt><dd className="font-medium text-[var(--srg-text-title)]">{personal.email || '-'}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-[var(--srg-text-muted)]">Localisation</dt><dd className="font-medium text-[var(--srg-text-title)]">{personal.city}, {personal.country}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-[var(--srg-text-muted)]">Societe</dt><dd className="font-medium text-[var(--srg-text-title)]">{company.company || '-'}</dd></div>
                  </dl>
                </div>
                <p className="text-xs text-[var(--srg-text-muted)]">
                  En cliquant sur « Creer le compte », vous confirmez que les informations ci-dessus sont exactes.
                </p>
              </div>
            ) : null}

            {/* Navigation etapes */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--srg-border)] pt-4">
              <button type="button" onClick={previousStep} disabled={step === 1} className={secondaryButtonClass}>
                Precedent
              </button>
              {step < 4 ? (
                <button type="button" onClick={nextStep} className={primaryButtonClass}>
                  Suivant
                </button>
              ) : (
                <button type="button" onClick={submitRegistration} disabled={isSubmittingRegistration} className={primaryButtonClass}>
                  {isSubmittingRegistration ? 'Creation...' : 'Creer le compte'}
                </button>
              )}
            </div>

            {registerStatus ? <p className="text-sm text-[var(--srg-text-muted)]">{registerStatus}</p> : null}

            {createdIdentity ? (
              <div className="rounded-xl border border-[var(--srg-color-primary-500)]/40 bg-[var(--srg-color-primary-500)]/10 p-4 text-sm">
                <p className="font-semibold text-[var(--srg-text-title)]">Votre compte SRG a ete cree.</p>
                <p className="mt-1 text-[var(--srg-text-body)]">
                  Matricule : <strong className="font-mono text-[var(--srg-color-primary-500)]">{createdIdentity.matricule}</strong>
                </p>
                <p className="mt-2 text-xs text-[var(--srg-text-muted)]">
                  Conservez precieusement ce matricule : il vous permet egalement de vous connecter a votre espace SRG, en plus de votre username.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* ==================== CONNEXION ==================== */}
        {mode === 'login' ? (
          <div className="space-y-4">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-[var(--srg-text-title)]">Identifier</span>
              <input value={loginIdentifier} onChange={(event) => setLoginIdentifier(event.target.value)} className={inputClass} placeholder="Username ou Matricule SRG" aria-label="Identifier" />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-[var(--srg-text-title)]">Password</span>
              <input type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} className={inputClass} placeholder="Votre mot de passe" aria-label="Password" />
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-[var(--srg-border)]" />
              <span>Remember me</span>
            </label>

            <button type="button" onClick={handleLogin} className={`${primaryButtonClass} w-full`}>
              Se connecter
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('forgot')
                setForgotStatus('')
              }}
              className="w-full text-center text-sm font-medium text-[var(--srg-color-primary-500)] hover:underline"
            >
              Mot de passe oublie ?
            </button>

            {loginStatus ? <p className="text-sm text-[var(--srg-text-muted)]">{loginStatus}</p> : null}
          </div>
        ) : null}

        {/* ==================== MOT DE PASSE OUBLIE ==================== */}
        {mode === 'forgot' ? (
          <div className="space-y-4">
            {!otpSent ? (
              <>
                <p className="text-sm text-[var(--srg-text-muted)]">
                  Entrez votre numero de telephone pour recevoir un code de verification.
                </p>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-[var(--srg-text-title)]">Telephone</span>
                  <input value={otpPhone} onChange={(event) => setOtpPhone(event.target.value)} className={inputClass} placeholder="+33 6 12 34 56 78" />
                </label>
                <button type="button" onClick={startOtpReset} className={`${primaryButtonClass} w-full`}>
                  Envoyer le code de verification
                </button>
              </>
            ) : !otpVerified ? (
              <>
                <p className="text-sm text-[var(--srg-text-muted)]">
                  Un code de verification a ete envoye au <strong>{otpPhone}</strong>. Saisissez-le ci-dessous.
                </p>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-[var(--srg-text-title)]">Code de verification</span>
                  <input value={otpCode} onChange={(event) => setOtpCode(event.target.value)} className={inputClass} placeholder="Code a 6 chiffres" inputMode="numeric" />
                </label>
                {sandboxCode ? (
                  <p className="rounded-lg bg-[var(--srg-surface-strong)] px-3 py-2 text-xs text-[var(--srg-text-muted)]">
                    Environnement de demonstration — code : <strong className="font-mono">{sandboxCode}</strong>
                  </p>
                ) : null}
                <button type="button" onClick={verifyOtp} className={`${primaryButtonClass} w-full`}>
                  Verifier le code
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-[var(--srg-text-muted)]">
                  Code verifie. Choisissez votre nouveau mot de passe.
                </p>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-[var(--srg-text-title)]">Nouveau mot de passe</span>
                  <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={inputClass} placeholder="Nouveau mot de passe" />
                </label>
                <button type="button" onClick={finalizeReset} className={`${primaryButtonClass} w-full`}>
                  Reinitialiser le mot de passe
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                setMode('login')
                setForgotStatus('')
              }}
              className="w-full text-center text-sm font-medium text-[var(--srg-color-primary-500)] hover:underline"
            >
              Retour a la connexion
            </button>

            {forgotStatus ? <p className="text-sm text-[var(--srg-text-muted)]">{forgotStatus}</p> : null}
          </div>
        ) : null}
      </div>

      {/* Lien secondaire : retour accueil */}
      <p className="text-center text-xs text-[var(--srg-text-muted)]">
        <button type="button" onClick={() => navigate({ to: '/' })} className="hover:text-[var(--srg-text-title)] hover:underline">
          Retour a l'accueil SRG
        </button>
      </p>
    </div>
  )
}