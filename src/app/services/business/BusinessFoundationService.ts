import type { GenerationResponse } from '#/generator/response/GenerationResponse'
import type { ExecutionResponse } from '#/execution/response/ExecutionResponse'

export type UserRole = 'SuperAdmin' | 'Admin' | 'Manager' | 'User' | 'Guest'

export type FeatureFlagKey =
  | 'vision'
  | 'image'
  | 'streaming'
  | 'json'
  | 'audio'
  | 'workflow'
  | 'agents'
  | 'marketplace'

export type SubscriptionPlanName = 'Free' | 'Starter' | 'Professional' | 'Business' | 'Enterprise'

export type Permission = {
  id: string
  key: string
  label: string
  description: string
}

export type RoleDefinition = {
  role: UserRole
  permissions: string[]
}

export type Organization = {
  id: string
  name: string
  legalName: string
  country: string
  city: string
  createdAt: string
}

export type Department = {
  id: string
  organizationId: string
  name: string
  managerUserId?: string
  createdAt: string
}

export type Team = {
  id: string
  departmentId: string
  name: string
  leadUserId?: string
  createdAt: string
}

export type UserIdentity = {
  id: string
  matricule: string
  username: string
  phone: string
  email?: string
  role: UserRole
  organizationId?: string
  departmentId?: string
  teamId?: string
  createdAt: string
}

export type UserProfile = {
  userId: string
  firstName: string
  lastName: string
  country: string
  city: string
  preferredLanguage: string
  timezone: string
  photoUrl?: string
}

export type AuthCredential = {
  userId: string
  passwordHash: string
  passwordSalt: string
  passwordUpdatedAt: string
}

export type ForgotPasswordTicket = {
  id: string
  userId: string
  tokenHash: string
  expiresAt: string
  consumedAt?: string
}

export type Wallet = {
  id: string
  userId: string
  balance: number
  bonusBalance: number
  updatedAt: string
}

export type WalletTransactionType = 'recharge' | 'bonus' | 'consumption' | 'refund'

export type WalletTransaction = {
  id: string
  walletId: string
  userId: string
  type: WalletTransactionType
  amount: number
  note: string
  createdAt: string
}

export type CreditAccount = {
  id: string
  userId: string
  available: number
  reserved: number
  consumed: number
  refunded: number
  updatedAt: string
}

export type CreditTransactionType = 'reservation' | 'consumption' | 'refund'

export type CreditTransaction = {
  id: string
  accountId: string
  userId: string
  type: CreditTransactionType
  amount: number
  reason: string
  linkedRunId?: string
  createdAt: string
}

export type CreditHistory = {
  id: string
  userId: string
  snapshots: Array<{
    at: string
    available: number
    reserved: number
    consumed: number
    refunded: number
  }>
}

export type SubscriptionPlan = {
  id: string
  name: SubscriptionPlanName
  monthlyQuota: number
  includedCredits: number
  features: string[]
}

export type UserSubscription = {
  id: string
  userId: string
  planName: SubscriptionPlanName
  startedAt: string
  renewalAt: string
  status: 'active' | 'paused' | 'cancelled'
}

export type PaymentMethod = {
  id: string
  userId: string
  type: 'card' | 'bank' | 'mobile-money' | 'wallet'
  provider: string
  last4?: string
  label: string
}

export type Coupon = {
  id: string
  code: string
  discountPercent: number
  expiresAt: string
  active: boolean
}

export type Tax = {
  id: string
  label: string
  ratePercent: number
  country: string
}

export type Invoice = {
  id: string
  userId: string
  amount: number
  currency: string
  taxAmount: number
  status: 'draft' | 'issued' | 'paid' | 'cancelled'
  issuedAt: string
}

export type Payment = {
  id: string
  invoiceId: string
  userId: string
  methodId: string
  provider: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
}

export type PaymentProviderAdapter = {
  id: string
  label: string
  supports: string[]
  mode: 'mocked'
}

export type License = {
  id: string
  ownerType: 'organization' | 'user'
  ownerId: string
  planName: SubscriptionPlanName
  seats: number
  issuedAt: string
  expiresAt: string
}

export type FeatureFlags = Record<FeatureFlagKey, boolean>

export type BusinessLogLevel = 'info' | 'warn' | 'error'

export type BusinessLog = {
  id: string
  level: BusinessLogLevel
  operation: string
  message: string
  at: string
  metadata?: Record<string, unknown>
}

export type BusinessMetric = {
  id: string
  name: string
  value: number
  unit?: string
  at: string
  metadata?: Record<string, unknown>
}

export type BusinessEvent = {
  id: string
  type: string
  entityId?: string
  at: string
  payload?: Record<string, unknown>
}

export type BusinessTrace = {
  id: string
  operation: string
  startedAt: string
  endedAt: string
  status: 'ok' | 'failed'
}

export type AuthResult = {
  success: boolean
  user?: UserIdentity
  reason?: string
}

export type BusinessSnapshot = {
  users: UserIdentity[]
  profiles: UserProfile[]
  organizations: Organization[]
  departments: Department[]
  teams: Team[]
  wallets: Wallet[]
  walletTransactions: WalletTransaction[]
  creditAccounts: CreditAccount[]
  creditTransactions: CreditTransaction[]
  creditHistory: CreditHistory[]
  subscriptionPlans: SubscriptionPlan[]
  subscriptions: UserSubscription[]
  invoices: Invoice[]
  payments: Payment[]
  paymentMethods: PaymentMethod[]
  coupons: Coupon[]
  taxes: Tax[]
  licenses: License[]
  permissions: Permission[]
  roles: RoleDefinition[]
  featureFlagsByUser: Record<string, FeatureFlags>
  logs: BusinessLog[]
  metrics: BusinessMetric[]
  events: BusinessEvent[]
  traces: BusinessTrace[]
}

function nowIso(): string {
  return new Date().toISOString()
}

function nowDateKey(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '')
}

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function simpleHash(input: string, salt: string): string {
  let hash = 2166136261
  const value = `${salt}:${input}`
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return `h-${(hash >>> 0).toString(16)}`
}

function defaultFeatureFlags(): FeatureFlags {
  return {
    vision: false,
    image: false,
    streaming: true,
    json: true,
    audio: false,
    workflow: true,
    agents: false,
    marketplace: false,
  }
}

const PERMISSIONS: Permission[] = [
  { id: 'perm-users-read', key: 'users.read', label: 'Users Read', description: 'Read users list and profiles' },
  { id: 'perm-users-write', key: 'users.write', label: 'Users Write', description: 'Create and update users' },
  { id: 'perm-orgs-admin', key: 'organizations.admin', label: 'Organizations Admin', description: 'Manage organizations, departments, and teams' },
  { id: 'perm-roles-admin', key: 'roles.admin', label: 'Roles Admin', description: 'Manage roles and permissions' },
  { id: 'perm-wallet-admin', key: 'wallet.admin', label: 'Wallet Admin', description: 'Manage wallet operations' },
  { id: 'perm-credit-admin', key: 'credits.admin', label: 'Credits Admin', description: 'Manage credit reservations and refunds' },
  { id: 'perm-subscriptions-admin', key: 'subscriptions.admin', label: 'Subscriptions Admin', description: 'Manage subscriptions and quotas' },
  { id: 'perm-billing-admin', key: 'billing.admin', label: 'Billing Admin', description: 'Manage invoices, taxes, coupons, and payments' },
  { id: 'perm-licenses-admin', key: 'licenses.admin', label: 'Licenses Admin', description: 'Manage licenses and seats' },
  { id: 'perm-observability-read', key: 'observability.read', label: 'Observability Read', description: 'Access logs, metrics, events, and traces' },
]

const ROLES: RoleDefinition[] = [
  { role: 'SuperAdmin', permissions: PERMISSIONS.map((permission) => permission.key) },
  {
    role: 'Admin',
    permissions: [
      'users.read',
      'users.write',
      'organizations.admin',
      'roles.admin',
      'wallet.admin',
      'credits.admin',
      'subscriptions.admin',
      'billing.admin',
      'licenses.admin',
      'observability.read',
    ],
  },
  {
    role: 'Manager',
    permissions: ['users.read', 'organizations.admin', 'wallet.admin', 'credits.admin', 'subscriptions.admin', 'observability.read'],
  },
  {
    role: 'User',
    permissions: ['users.read'],
  },
  {
    role: 'Guest',
    permissions: [],
  },
]

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: 'plan-free', name: 'Free', monthlyQuota: 2000, includedCredits: 200, features: ['Basic prompts', 'Community support'] },
  { id: 'plan-starter', name: 'Starter', monthlyQuota: 15000, includedCredits: 1500, features: ['Prompt templates', 'History'] },
  { id: 'plan-professional', name: 'Professional', monthlyQuota: 60000, includedCredits: 6000, features: ['Streaming', 'JSON Mode', 'Priority queue'] },
  { id: 'plan-business', name: 'Business', monthlyQuota: 180000, includedCredits: 18000, features: ['Organizations', 'Teams', 'RBAC'] },
  { id: 'plan-enterprise', name: 'Enterprise', monthlyQuota: 600000, includedCredits: 60000, features: ['Dedicated support', 'Advanced governance'] },
]

const PAYMENT_PROVIDERS: PaymentProviderAdapter[] = [
  { id: 'stripe', label: 'Stripe', supports: ['card', 'invoice', 'subscription'], mode: 'mocked' },
  { id: 'flutterwave', label: 'Flutterwave', supports: ['card', 'bank', 'mobile-money'], mode: 'mocked' },
  { id: 'paypal', label: 'PayPal', supports: ['wallet', 'card'], mode: 'mocked' },
  { id: 'cinetpay', label: 'CinetPay', supports: ['mobile-money'], mode: 'mocked' },
  { id: 'orange-money', label: 'Orange Money', supports: ['mobile-money'], mode: 'mocked' },
  { id: 'mtn-momo', label: 'MTN Mobile Money', supports: ['mobile-money'], mode: 'mocked' },
]

export class BusinessFoundationService {
  private static users: UserIdentity[] = []
  private static profiles: UserProfile[] = []
  private static credentials: AuthCredential[] = []
  private static forgotTickets: ForgotPasswordTicket[] = []

  private static organizations: Organization[] = []
  private static departments: Department[] = []
  private static teams: Team[] = []

  private static wallets: Wallet[] = []
  private static walletTransactions: WalletTransaction[] = []

  private static creditAccounts: CreditAccount[] = []
  private static creditTransactions: CreditTransaction[] = []
  private static creditHistory: CreditHistory[] = []

  private static subscriptions: UserSubscription[] = []
  private static invoices: Invoice[] = []
  private static payments: Payment[] = []
  private static paymentMethods: PaymentMethod[] = []
  private static coupons: Coupon[] = []
  private static taxes: Tax[] = []
  private static licenses: License[] = []

  private static featureFlagsByUser: Record<string, FeatureFlags> = {}

  private static logs: BusinessLog[] = []
  private static metrics: BusinessMetric[] = []
  private static events: BusinessEvent[] = []
  private static traces: BusinessTrace[] = []

  private static sequenceByDate: Record<string, number> = {}
  private static initialized = false

  private static ensureInit() {
    if (this.initialized) return

    const organization = this.createOrganizationInternal({
      name: 'SRG Corporation',
      legalName: 'SRG Corporation Ltd',
      country: 'France',
      city: 'Paris',
    })

    const department = this.createDepartmentInternal({
      organizationId: organization.id,
      name: 'AI Platform',
    })

    const team = this.createTeamInternal({
      departmentId: department.id,
      name: 'Core Workspace',
    })

    const superAdmin = this.createUserInternal({
      username: 'superadmin',
      phone: '+33100000001',
      email: 'admin@srg.local',
      password: 'Srg@2026!Temp',
      role: 'SuperAdmin',
      profile: {
        firstName: 'Alice',
        lastName: 'Durand',
        country: 'France',
        city: 'Paris',
        preferredLanguage: 'Français',
        timezone: 'Europe/Paris',
      },
      organizationId: organization.id,
      departmentId: department.id,
      teamId: team.id,
    })

    this.createUserInternal({
      username: 'manager',
      phone: '+33100000002',
      email: 'manager@srg.local',
      password: 'Srg@2026!Temp',
      role: 'Manager',
      profile: {
        firstName: 'Marc',
        lastName: 'Leroy',
        country: 'France',
        city: 'Lyon',
        preferredLanguage: 'Français',
        timezone: 'Europe/Paris',
      },
      organizationId: organization.id,
      departmentId: department.id,
      teamId: team.id,
    })

    this.addPaymentMethodInternal({
      userId: superAdmin.id,
      type: 'card',
      provider: 'stripe',
      last4: '4242',
      label: 'Corporate Visa',
    })

    this.coupons = [
      {
        id: 'coupon-launch-10',
        code: 'LAUNCH10',
        discountPercent: 10,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        active: true,
      },
    ]

    this.taxes = [
      {
        id: 'tax-fr-vat',
        label: 'VAT France',
        ratePercent: 20,
        country: 'France',
      },
    ]

    this.initialized = true
  }

  static getSnapshot(): BusinessSnapshot {
    this.ensureInit()
    return {
      users: [...this.users],
      profiles: [...this.profiles],
      organizations: [...this.organizations],
      departments: [...this.departments],
      teams: [...this.teams],
      wallets: [...this.wallets],
      walletTransactions: [...this.walletTransactions],
      creditAccounts: [...this.creditAccounts],
      creditTransactions: [...this.creditTransactions],
      creditHistory: [...this.creditHistory],
      subscriptionPlans: [...SUBSCRIPTION_PLANS],
      subscriptions: [...this.subscriptions],
      invoices: [...this.invoices],
      payments: [...this.payments],
      paymentMethods: [...this.paymentMethods],
      coupons: [...this.coupons],
      taxes: [...this.taxes],
      licenses: [...this.licenses],
      permissions: [...PERMISSIONS],
      roles: [...ROLES],
      featureFlagsByUser: { ...this.featureFlagsByUser },
      logs: [...this.logs],
      metrics: [...this.metrics],
      events: [...this.events],
      traces: [...this.traces],
    }
  }

  static getPaymentProviders(): PaymentProviderAdapter[] {
    return [...PAYMENT_PROVIDERS]
  }

  static createUser(input: {
    username: string
    phone: string
    email?: string
    password: string
    role: UserRole
    profile: Omit<UserProfile, 'userId'>
    organizationId?: string
    departmentId?: string
    teamId?: string
  }): UserIdentity {
    this.ensureInit()

    return this.createUserInternal(input)
  }

  static authenticate(identifier: string, password: string): AuthResult {
    this.ensureInit()

    const normalized = identifier.trim().toLowerCase()
    const user = this.users.find((candidate) => candidate.username.toLowerCase() === normalized || candidate.matricule.toLowerCase() === normalized)
    if (!user) {
      this.observe('auth.login.failed', 'Authentication failed: user not found', { identifier })
      return { success: false, reason: 'user_not_found' }
    }

    const credential = this.credentials.find((item) => item.userId === user.id)
    if (!credential) {
      this.observe('auth.login.failed', 'Authentication failed: credential not found', { userId: user.id })
      return { success: false, reason: 'credential_not_found' }
    }

    const candidateHash = simpleHash(password, credential.passwordSalt)
    if (candidateHash !== credential.passwordHash) {
      this.observe('auth.login.failed', 'Authentication failed: invalid password', { userId: user.id })
      return { success: false, reason: 'invalid_password' }
    }

    this.observe('auth.login.success', 'Authentication success', { userId: user.id })
    return { success: true, user }
  }

  static requestForgotPassword(identifier: string): { ticketId: string } {
    this.ensureInit()
    const normalized = identifier.trim().toLowerCase()
    const user = this.users.find((candidate) => candidate.username.toLowerCase() === normalized || candidate.matricule.toLowerCase() === normalized)
    if (!user) {
      throw new Error('Unknown user for forgot password.')
    }

    const plainToken = randomId('reset')
    const tokenHash = simpleHash(plainToken, user.id)
    const ticket: ForgotPasswordTicket = {
      id: randomId('ticket'),
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }

    this.forgotTickets = [ticket, ...this.forgotTickets]
    this.observe('auth.password.forgot', 'Forgot password ticket created', { userId: user.id, ticketId: ticket.id })

    return { ticketId: ticket.id }
  }

  static resetPassword(ticketId: string, newPassword: string): void {
    this.ensureInit()

    const ticket = this.forgotTickets.find((item) => item.id === ticketId)
    if (!ticket) {
      throw new Error('Invalid reset ticket.')
    }

    if (ticket.consumedAt) {
      throw new Error('Reset ticket already consumed.')
    }

    if (new Date(ticket.expiresAt).getTime() < Date.now()) {
      throw new Error('Reset ticket expired.')
    }

    this.credentials = this.credentials.map((credential) => {
      if (credential.userId !== ticket.userId) return credential
      const nextSalt = randomId('salt')
      return {
        ...credential,
        passwordSalt: nextSalt,
        passwordHash: simpleHash(newPassword, nextSalt),
        passwordUpdatedAt: nowIso(),
      }
    })

    this.forgotTickets = this.forgotTickets.map((item) =>
      item.id === ticketId ? { ...item, consumedAt: nowIso() } : item,
    )

    this.observe('auth.password.reset', 'Password reset completed', { ticketId, userId: ticket.userId })
  }

  static createOrganization(input: { name: string; legalName: string; country: string; city: string }): Organization {
    this.ensureInit()
    return this.createOrganizationInternal(input)
  }

  static createDepartment(input: { organizationId: string; name: string; managerUserId?: string }): Department {
    this.ensureInit()
    return this.createDepartmentInternal(input)
  }

  static createTeam(input: { departmentId: string; name: string; leadUserId?: string }): Team {
    this.ensureInit()
    return this.createTeamInternal(input)
  }

  static assignUserToStructure(input: { userId: string; organizationId?: string; departmentId?: string; teamId?: string }): void {
    this.ensureInit()
    this.users = this.users.map((user) =>
      user.id === input.userId
        ? {
            ...user,
            organizationId: input.organizationId,
            departmentId: input.departmentId,
            teamId: input.teamId,
          }
        : user,
    )

    this.observe('organization.assignment.update', 'User organization assignment updated', input)
  }

  static setUserRole(userId: string, role: UserRole): void {
    this.ensureInit()
    this.users = this.users.map((user) => (user.id === userId ? { ...user, role } : user))
    this.observe('rbac.role.assign', 'Role assigned to user', { userId, role })
  }

  static updateUserPhone(userId: string, phone: string): void {
    this.ensureInit()

    if (!phone.trim()) {
      throw new Error('Phone is required.')
    }

    if (this.users.some((user) => user.id !== userId && user.phone.trim() === phone.trim())) {
      throw new Error('Phone already exists.')
    }

    this.users = this.users.map((user) => (user.id === userId ? { ...user, phone: phone.trim() } : user))
    this.observe('identity.user.phone.update', 'User phone updated', { userId })
  }

  static updateUserPreferredLanguage(userId: string, preferredLanguage: string): void {
    this.ensureInit()
    this.profiles = this.profiles.map((profile) =>
      profile.userId === userId ? { ...profile, preferredLanguage } : profile,
    )
    this.observe('identity.user.language.update', 'User preferred language updated', { userId, preferredLanguage })
  }

  static hasPermission(userId: string, permissionKey: string): boolean {
    this.ensureInit()
    const user = this.users.find((item) => item.id === userId)
    if (!user) return false
    const role = ROLES.find((item) => item.role === user.role)
    return role ? role.permissions.includes(permissionKey) : false
  }

  static toggleFeatureFlag(userId: string, key: FeatureFlagKey, enabled: boolean): void {
    this.ensureInit()
    const current = this.featureFlagsByUser[userId] ?? defaultFeatureFlags()
    this.featureFlagsByUser[userId] = { ...current, [key]: enabled }
    this.observe('feature-flag.update', 'Feature flag toggled', { userId, key, enabled })
  }

  static rechargeWallet(userId: string, amount: number, note = 'Recharge'): WalletTransaction {
    this.ensureInit()
    const wallet = this.ensureWallet(userId)
    const transaction: WalletTransaction = {
      id: randomId('wtx'),
      walletId: wallet.id,
      userId,
      type: 'recharge',
      amount,
      note,
      createdAt: nowIso(),
    }

    this.walletTransactions = [transaction, ...this.walletTransactions]
    this.wallets = this.wallets.map((item) =>
      item.id === wallet.id
        ? { ...item, balance: Number((item.balance + amount).toFixed(2)), updatedAt: nowIso() }
        : item,
    )

    this.observe('wallet.recharge', 'Wallet recharged', { userId, amount })
    return transaction
  }

  static addWalletBonus(userId: string, amount: number, note = 'Bonus'): WalletTransaction {
    this.ensureInit()
    const wallet = this.ensureWallet(userId)
    const transaction: WalletTransaction = {
      id: randomId('wtx'),
      walletId: wallet.id,
      userId,
      type: 'bonus',
      amount,
      note,
      createdAt: nowIso(),
    }

    this.walletTransactions = [transaction, ...this.walletTransactions]
    this.wallets = this.wallets.map((item) =>
      item.id === wallet.id
        ? {
            ...item,
            bonusBalance: Number((item.bonusBalance + amount).toFixed(2)),
            updatedAt: nowIso(),
          }
        : item,
    )

    this.observe('wallet.bonus', 'Wallet bonus added', { userId, amount })
    return transaction
  }

  static reserveCredit(userId: string, amount: number, reason: string, linkedRunId?: string): CreditTransaction {
    this.ensureInit()
    const account = this.ensureCreditAccount(userId)

    if (account.available < amount) {
      throw new Error('Insufficient available credit to reserve.')
    }

    this.creditAccounts = this.creditAccounts.map((item) =>
      item.id === account.id
        ? {
            ...item,
            available: Number((item.available - amount).toFixed(2)),
            reserved: Number((item.reserved + amount).toFixed(2)),
            updatedAt: nowIso(),
          }
        : item,
    )

    const transaction: CreditTransaction = {
      id: randomId('ctx'),
      accountId: account.id,
      userId,
      type: 'reservation',
      amount,
      reason,
      linkedRunId,
      createdAt: nowIso(),
    }

    this.creditTransactions = [transaction, ...this.creditTransactions]
    this.pushCreditSnapshot(userId)
    this.observe('credit.reserve', 'Credits reserved', { userId, amount, linkedRunId })
    return transaction
  }

  static consumeReservedCredit(userId: string, amount: number, reason: string, linkedRunId?: string): CreditTransaction {
    this.ensureInit()
    const account = this.ensureCreditAccount(userId)

    if (account.reserved < amount) {
      throw new Error('Insufficient reserved credit to consume.')
    }

    this.creditAccounts = this.creditAccounts.map((item) =>
      item.id === account.id
        ? {
            ...item,
            reserved: Number((item.reserved - amount).toFixed(2)),
            consumed: Number((item.consumed + amount).toFixed(2)),
            updatedAt: nowIso(),
          }
        : item,
    )

    const transaction: CreditTransaction = {
      id: randomId('ctx'),
      accountId: account.id,
      userId,
      type: 'consumption',
      amount,
      reason,
      linkedRunId,
      createdAt: nowIso(),
    }

    this.creditTransactions = [transaction, ...this.creditTransactions]
    this.pushCreditSnapshot(userId)
    this.observe('credit.consume', 'Reserved credits consumed', { userId, amount, linkedRunId })
    return transaction
  }

  static refundCredit(userId: string, amount: number, reason: string, linkedRunId?: string): CreditTransaction {
    this.ensureInit()
    const account = this.ensureCreditAccount(userId)

    this.creditAccounts = this.creditAccounts.map((item) =>
      item.id === account.id
        ? {
            ...item,
            available: Number((item.available + amount).toFixed(2)),
            refunded: Number((item.refunded + amount).toFixed(2)),
            updatedAt: nowIso(),
          }
        : item,
    )

    const transaction: CreditTransaction = {
      id: randomId('ctx'),
      accountId: account.id,
      userId,
      type: 'refund',
      amount,
      reason,
      linkedRunId,
      createdAt: nowIso(),
    }

    this.creditTransactions = [transaction, ...this.creditTransactions]
    this.pushCreditSnapshot(userId)
    this.observe('credit.refund', 'Credits refunded', { userId, amount, linkedRunId })
    return transaction
  }

  static createSubscription(input: { userId: string; planName: SubscriptionPlanName; status?: UserSubscription['status'] }): UserSubscription {
    this.ensureInit()
    return this.createSubscriptionInternal(input)
  }

  static createInvoice(input: { userId: string; amount: number; currency?: string; taxAmount?: number }): Invoice {
    this.ensureInit()

    const invoice: Invoice = {
      id: randomId('inv'),
      userId: input.userId,
      amount: input.amount,
      currency: input.currency ?? 'EUR',
      taxAmount: input.taxAmount ?? 0,
      status: 'issued',
      issuedAt: nowIso(),
    }

    this.invoices = [invoice, ...this.invoices]
    this.observe('billing.invoice.create', 'Invoice issued', { invoiceId: invoice.id, userId: input.userId })
    return invoice
  }

  static addPaymentMethod(input: Omit<PaymentMethod, 'id'>): PaymentMethod {
    this.ensureInit()
    return this.addPaymentMethodInternal(input)
  }

  static recordPayment(input: { invoiceId: string; userId: string; methodId: string; provider: string; amount: number }): Payment {
    this.ensureInit()

    const payment: Payment = {
      id: randomId('pay'),
      invoiceId: input.invoiceId,
      userId: input.userId,
      methodId: input.methodId,
      provider: input.provider,
      amount: input.amount,
      status: 'completed',
      createdAt: nowIso(),
    }

    this.payments = [payment, ...this.payments]
    this.invoices = this.invoices.map((invoice) =>
      invoice.id === input.invoiceId ? { ...invoice, status: 'paid' } : invoice,
    )

    this.observe('billing.payment.record', 'Payment recorded', { paymentId: payment.id, invoiceId: input.invoiceId })
    return payment
  }

  static issueLicense(input: { ownerType: License['ownerType']; ownerId: string; planName: SubscriptionPlanName; seats: number; expiresAt: string }): License {
    this.ensureInit()

    const license: License = {
      id: randomId('lic'),
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      planName: input.planName,
      seats: input.seats,
      issuedAt: nowIso(),
      expiresAt: input.expiresAt,
    }

    this.licenses = [license, ...this.licenses]
    this.observe('license.issue', 'License issued', { licenseId: license.id, ownerType: input.ownerType })
    return license
  }

  static captureGenerationExecution(input: {
    userId: string
    generationId: string
    requestId: string
    generationResponse: GenerationResponse
    executionResponse?: ExecutionResponse
    provider: string
    model: string
  }): void {
    this.ensureInit()

    const outputText = input.generationResponse.content ?? ''
    const estimatedTokensOutput = Math.max(1, Math.ceil(outputText.length / 4))
    const estimatedTokensInput = Math.max(1, Math.ceil((input.executionResponse?.metadata?.requestPayloadLength as number | undefined) ?? outputText.length / 5))
    const consumedCredit = Number(((estimatedTokensInput + estimatedTokensOutput) * 0.01).toFixed(2))

    try {
      this.reserveCredit(input.userId, consumedCredit, 'Generation reservation', input.generationId)
      this.consumeReservedCredit(input.userId, consumedCredit, 'Generation consumption', input.generationId)
    } catch {
      this.observe('credit.consume.failed', 'Failed to consume credits from generation run', {
        userId: input.userId,
        generationId: input.generationId,
        consumedCredit,
      })
    }

    this.observe('generation.execution.capture', 'Generation + execution telemetry captured', {
      userId: input.userId,
      generationId: input.generationId,
      requestId: input.requestId,
      provider: input.provider,
      model: input.model,
      status: input.generationResponse.status,
    })

    this.metrics = [
      {
        id: randomId('metric'),
        name: 'generation.tokens.total',
        value: estimatedTokensInput + estimatedTokensOutput,
        unit: 'tokens',
        at: nowIso(),
        metadata: {
          generationId: input.generationId,
          provider: input.provider,
          model: input.model,
        },
      },
      ...this.metrics,
    ]
  }

  static getAdminCounts() {
    this.ensureInit()

    return {
      users: this.users.length,
      organizations: this.organizations.length,
      departments: this.departments.length,
      teams: this.teams.length,
      wallets: this.wallets.length,
      credits: this.creditAccounts.length,
      subscriptions: this.subscriptions.length,
      invoices: this.invoices.length,
      payments: this.payments.length,
      licenses: this.licenses.length,
      logs: this.logs.length,
      metrics: this.metrics.length,
      events: this.events.length,
      traces: this.traces.length,
    }
  }

  private static createOrganizationInternal(input: { name: string; legalName: string; country: string; city: string }): Organization {
    const organization: Organization = {
      id: randomId('org'),
      name: input.name,
      legalName: input.legalName,
      country: input.country,
      city: input.city,
      createdAt: nowIso(),
    }

    this.organizations = [organization, ...this.organizations]
    this.observe('organization.create', 'Organization created', { organizationId: organization.id })
    return organization
  }

  private static createDepartmentInternal(input: { organizationId: string; name: string; managerUserId?: string }): Department {
    const department: Department = {
      id: randomId('dep'),
      organizationId: input.organizationId,
      name: input.name,
      managerUserId: input.managerUserId,
      createdAt: nowIso(),
    }

    this.departments = [department, ...this.departments]
    this.observe('organization.department.create', 'Department created', { departmentId: department.id, organizationId: input.organizationId })
    return department
  }

  private static createTeamInternal(input: { departmentId: string; name: string; leadUserId?: string }): Team {
    const team: Team = {
      id: randomId('team'),
      departmentId: input.departmentId,
      name: input.name,
      leadUserId: input.leadUserId,
      createdAt: nowIso(),
    }

    this.teams = [team, ...this.teams]
    this.observe('organization.team.create', 'Team created', { teamId: team.id, departmentId: input.departmentId })
    return team
  }

  private static createUserInternal(input: {
    username: string
    phone: string
    email?: string
    password: string
    role: UserRole
    profile: Omit<UserProfile, 'userId'>
    organizationId?: string
    departmentId?: string
    teamId?: string
  }): UserIdentity {
    if (!input.phone.trim()) {
      throw new Error('Phone is required for user creation.')
    }

    if (this.users.some((user) => user.username.toLowerCase() === input.username.toLowerCase())) {
      throw new Error('Username already exists.')
    }

    if (this.users.some((user) => user.phone.trim() === input.phone.trim())) {
      throw new Error('Phone already exists.')
    }

    const traceStart = nowIso()
    const userId = randomId('usr')
    const matricule = this.generateMatricule()

    const user: UserIdentity = {
      id: userId,
      matricule,
      username: input.username,
      phone: input.phone,
      email: input.email,
      role: input.role,
      organizationId: input.organizationId,
      departmentId: input.departmentId,
      teamId: input.teamId,
      createdAt: nowIso(),
    }

    const profile: UserProfile = {
      userId,
      ...input.profile,
    }

    const passwordSalt = randomId('salt')
    const credential: AuthCredential = {
      userId,
      passwordHash: simpleHash(input.password, passwordSalt),
      passwordSalt,
      passwordUpdatedAt: nowIso(),
    }

    this.users = [user, ...this.users]
    this.profiles = [profile, ...this.profiles]
    this.credentials = [credential, ...this.credentials]

    this.createWalletInternal(userId)
    this.ensureDefaultSubscriptionInternal(userId)
    this.ensureCreditAccount(userId)
    this.featureFlagsByUser[userId] = defaultFeatureFlags()

    this.observe('identity.user.create', 'User created', {
      userId,
      role: input.role,
      matricule,
    })
    this.traces = [
      {
        id: randomId('trace'),
        operation: 'identity.user.create',
        startedAt: traceStart,
        endedAt: nowIso(),
        status: 'ok',
      },
      ...this.traces,
    ]

    return user
  }

  private static createWalletInternal(userId: string): Wallet {
    const existing = this.wallets.find((wallet) => wallet.userId === userId)
    if (existing) {
      return existing
    }

    const wallet: Wallet = {
      id: randomId('wallet'),
      userId,
      balance: 0,
      bonusBalance: 0,
      updatedAt: nowIso(),
    }
    this.wallets = [wallet, ...this.wallets]
    return wallet
  }

  private static createSubscriptionInternal(input: { userId: string; planName: SubscriptionPlanName; status?: UserSubscription['status'] }): UserSubscription {
    const now = new Date()
    const renewal = new Date(now)
    renewal.setMonth(renewal.getMonth() + 1)

    const subscription: UserSubscription = {
      id: randomId('sub'),
      userId: input.userId,
      planName: input.planName,
      startedAt: now.toISOString(),
      renewalAt: renewal.toISOString(),
      status: input.status ?? 'active',
    }

    this.subscriptions = [subscription, ...this.subscriptions.filter((item) => item.userId !== input.userId)]
    this.observe('subscription.create', 'Subscription created or updated', { userId: input.userId, planName: input.planName })
    return subscription
  }

  private static addPaymentMethodInternal(input: Omit<PaymentMethod, 'id'>): PaymentMethod {
    const method: PaymentMethod = {
      id: randomId('pm'),
      ...input,
    }

    this.paymentMethods = [method, ...this.paymentMethods]
    this.observe('billing.payment-method.create', 'Payment method registered', { userId: input.userId, methodId: method.id })
    return method
  }

  private static ensureWallet(userId: string): Wallet {
    return this.createWalletInternal(userId)
  }

  private static ensureCreditAccount(userId: string): CreditAccount {
    const existing = this.creditAccounts.find((account) => account.userId === userId)
    if (existing) return existing

    const subscription = this.subscriptions.find((item) => item.userId === userId)
    const planName = subscription?.planName ?? 'Free'
    const plan = SUBSCRIPTION_PLANS.find((item) => item.name === planName) ?? SUBSCRIPTION_PLANS[0]

    const account: CreditAccount = {
      id: randomId('credit'),
      userId,
      available: plan.includedCredits,
      reserved: 0,
      consumed: 0,
      refunded: 0,
      updatedAt: nowIso(),
    }
    this.creditAccounts = [account, ...this.creditAccounts]
    this.creditHistory = [
      {
        id: randomId('ch'),
        userId,
        snapshots: [],
      },
      ...this.creditHistory,
    ]
    this.pushCreditSnapshot(userId)
    return account
  }

  private static ensureDefaultSubscriptionInternal(userId: string): UserSubscription {
    const existing = this.subscriptions.find((item) => item.userId === userId)
    if (existing) return existing
    return this.createSubscriptionInternal({ userId, planName: 'Free' })
  }

  private static pushCreditSnapshot(userId: string): void {
    const account = this.creditAccounts.find((item) => item.userId === userId)
    if (!account) return

    const history = this.creditHistory.find((item) => item.userId === userId)
    if (!history) return

    history.snapshots = [
      {
        at: nowIso(),
        available: account.available,
        reserved: account.reserved,
        consumed: account.consumed,
        refunded: account.refunded,
      },
      ...history.snapshots,
    ].slice(0, 20)
  }

  private static generateMatricule(): string {
    const dateKey = nowDateKey()
    const nextValue = (this.sequenceByDate[dateKey] ?? 0) + 1
    this.sequenceByDate[dateKey] = nextValue

    const sequence = String(nextValue).padStart(6, '0')
    const matricule = `SRG${dateKey}-${sequence}`

    if (this.users.some((user) => user.matricule === matricule)) {
      return this.generateMatricule()
    }

    return matricule
  }

  private static observe(operation: string, message: string, metadata?: Record<string, unknown>) {
    const timestamp = nowIso()
    const logEntry: BusinessLog = {
      id: randomId('log'),
      level: 'info',
      operation,
      message,
      at: timestamp,
      metadata,
    }

    this.logs = [
      logEntry,
      ...this.logs,
    ].slice(0, 300)

    this.events = [
      {
        id: randomId('evt'),
        type: operation,
        at: timestamp,
        payload: metadata,
      },
      ...this.events,
    ].slice(0, 300)

    this.metrics = [
      {
        id: randomId('metric'),
        name: `${operation}.count`,
        value: 1,
        unit: 'count',
        at: timestamp,
      },
      ...this.metrics,
    ].slice(0, 300)

    const traceEntry: BusinessTrace = {
      id: randomId('trace'),
      operation,
      startedAt: timestamp,
      endedAt: timestamp,
      status: 'ok',
    }

    this.traces = [
      traceEntry,
      ...this.traces,
    ].slice(0, 300)
  }
}
