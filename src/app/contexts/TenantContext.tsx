import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type TenantReadinessBadge = {
  label: string
  status: string
}

export type TenantProfile = {
  tenantId: string
  tenantName: string
  workspaceName: string
  language: string
  timezone: string
  currency: string
  country: string
  industry: string
  logo: string
  accent: string
  activeEnterprise: string
  activeUser: string
  consultedModules: string[]
  conversations: string
  documents: string
  readinessBadges: TenantReadinessBadge[]
}

type TenantContextValue = TenantProfile & {
  tenants: TenantProfile[]
  switchTenant: (tenantId: string) => void
}

const STORAGE_KEY = 'srg.workspace.tenant.v1'

const TENANTS: TenantProfile[] = [
  {
    tenantId: 'tenant-srg-industries-holding',
    tenantName: 'SRG Industries Holding',
    workspaceName: 'Executive Workspace',
    language: 'Français',
    timezone: 'Europe/Paris',
    currency: 'EUR',
    country: 'France',
    industry: 'Industrial Services',
    logo: 'SRG',
    accent: 'from-[rgba(79,184,178,0.28)] to-[rgba(47,106,74,0.16)]',
    activeEnterprise: 'SRG Industries Holding',
    activeUser: 'Enterprise user placeholder',
    consultedModules: ['Dashboard', 'Knowledge Intelligence', 'Workflow Automation'],
    conversations: 'Placeholder · 12 conversations',
    documents: 'Placeholder · 28 documents',
    readinessBadges: [
      { label: 'Tenant Ready', status: 'Prepared' },
      { label: 'API Ready', status: 'Placeholder' },
      { label: 'Ask SRG Ready', status: 'Prepared' },
    ],
  },
  {
    tenantId: 'tenant-atlas-metalworks',
    tenantName: 'Atlas Metalworks',
    workspaceName: 'Operations Workspace',
    language: 'English',
    timezone: 'Europe/London',
    currency: 'GBP',
    country: 'United Kingdom',
    industry: 'Manufacturing',
    logo: 'AT',
    accent: 'from-[rgba(47,106,74,0.24)] to-[rgba(23,58,64,0.14)]',
    activeEnterprise: 'Atlas Metalworks',
    activeUser: 'Operations user placeholder',
    consultedModules: ['Dashboard', 'Maintenance', 'Procurement'],
    conversations: 'Placeholder · 8 conversations',
    documents: 'Placeholder · 14 documents',
    readinessBadges: [
      { label: 'Tenant Ready', status: 'Prepared' },
      { label: 'API Ready', status: 'Preview' },
      { label: 'Ask SRG Ready', status: 'Prepared' },
    ],
  },
  {
    tenantId: 'tenant-nova-energy',
    tenantName: 'Nova Energy Group',
    workspaceName: 'Strategy Workspace',
    language: 'Español',
    timezone: 'Europe/Madrid',
    currency: 'EUR',
    country: 'Spain',
    industry: 'Energy Services',
    logo: 'NV',
    accent: 'from-[rgba(23,58,64,0.24)] to-[rgba(79,184,178,0.14)]',
    activeEnterprise: 'Nova Energy Group',
    activeUser: 'Strategy user placeholder',
    consultedModules: ['Enterprise Insights', 'Strategic Advisor', 'History'],
    conversations: 'Placeholder · 5 conversations',
    documents: 'Placeholder · 11 documents',
    readinessBadges: [
      { label: 'Tenant Ready', status: 'Prepared' },
      { label: 'API Ready', status: 'Placeholder' },
      { label: 'Ask SRG Ready', status: 'Preview' },
    ],
  },
]

const TenantContext = createContext<TenantContextValue | undefined>(undefined)

function getStoredTenantId() {
  if (typeof window === 'undefined') {
    return TENANTS[0]?.tenantId ?? ''
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return TENANTS.some((tenant) => tenant.tenantId === stored) ? stored : TENANTS[0]?.tenantId ?? ''
  } catch {
    return TENANTS[0]?.tenantId ?? ''
  }
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantId] = useState(() => getStoredTenantId())

  const activeTenant = useMemo(() => TENANTS.find((tenant) => tenant.tenantId === tenantId) ?? TENANTS[0], [tenantId])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, activeTenant.tenantId)
  }, [activeTenant.tenantId])

  const value = useMemo<TenantContextValue>(
    () => ({
      ...activeTenant,
      tenants: TENANTS,
      switchTenant: (nextTenantId: string) => {
        const nextTenant = TENANTS.find((tenant) => tenant.tenantId === nextTenantId)
        if (nextTenant) {
          setTenantId(nextTenant.tenantId)
        }
      },
    }),
    [activeTenant],
  )

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenantContext() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenantContext must be used inside TenantProvider')
  }
  return context
}