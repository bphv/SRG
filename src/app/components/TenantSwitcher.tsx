import { useTenantContext } from '#/app/contexts/TenantContext'

export default function TenantSwitcher() {
  const tenant = useTenantContext()

  return (
    <label className="flex min-w-[18rem] flex-col gap-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 shadow-[var(--srg-shadow-sm)]">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--srg-text-muted)]">
        Tenant switcher
      </span>
      <div className={`flex items-center gap-3 rounded-2xl bg-gradient-to-r px-3 py-2 text-sm text-white ${tenant.accent}`}>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-xs font-semibold uppercase tracking-[0.18em]">
          {tenant.logo}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold">{tenant.tenantName}</p>
          <p className="truncate text-xs text-white/80">{tenant.workspaceName}</p>
        </div>
      </div>
      <select
        value={tenant.tenantId}
        onChange={(event) => tenant.switchTenant(event.target.value)}
        aria-label="Select tenant"
        className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm text-[var(--srg-text-body)]"
      >
        {tenant.tenants.map((option) => (
          <option key={option.tenantId} value={option.tenantId}>
            {option.tenantName} · {option.workspaceName}
          </option>
        ))}
      </select>
    </label>
  )
}