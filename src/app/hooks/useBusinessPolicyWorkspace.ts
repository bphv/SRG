import { useMemo, useState } from 'react'
import { BusinessPolicyWorkspaceService } from '#/app/services/BusinessPolicyWorkspaceService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'
import type { PolicyDomain } from '#/app/services/BusinessPolicyWorkspaceService'

export function useBusinessPolicyWorkspace() {
  const [tick, setTick] = useState(0)
  const preferences = WorkspacePreferencesService.getPreferences()
  const persisted = preferences.filters['business-policy-workspace'] as Record<string, string | boolean | number> | undefined

  const [selectedDomain, setSelectedDomainState] = useState<PolicyDomain>(
    isDomain(persisted?.selectedDomain) ? persisted.selectedDomain : 'commercial',
  )

  const refresh = () => setTick((value) => value + 1)

  const setSelectedDomain = (domain: PolicyDomain) => {
    setSelectedDomainState(domain)
    WorkspacePreferencesService.setFilters('business-policy-workspace', {
      ...(persisted ?? {}),
      selectedDomain: domain,
    })
  }

  const store = useMemo(() => BusinessPolicyWorkspaceService.getStore(), [tick])
  const summary = useMemo(() => BusinessPolicyWorkspaceService.getSummary(), [tick])

  return {
    store,
    summary,
    refresh,
    selectedDomain,
    setSelectedDomain,
    domains: BusinessPolicyWorkspaceService.getPolicyDomains(),
    coefficientKeys: BusinessPolicyWorkspaceService.getCoefficientKeys(),
  }
}

function isDomain(value: unknown): value is PolicyDomain {
  return value === 'commercial'
    || value === 'purchase'
    || value === 'sales'
    || value === 'financial'
    || value === 'maintenance'
    || value === 'quality'
    || value === 'security'
    || value === 'logistics'
    || value === 'hr'
    || value === 'procurement'
}
