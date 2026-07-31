import { BusinessFoundationService } from '#/app/services/business/BusinessFoundationService'
import type { BusinessEvents } from '#/business/orchestrator/BusinessEvents'
import type { BusinessState } from '#/business/orchestrator/BusinessState'
import type { BusinessOrchestratorContext } from '#/business/orchestrator/types'

export class BusinessContextBuilder {
  constructor(
    private readonly state: BusinessState,
    private readonly events: BusinessEvents,
  ) {}

  build(userId?: string): BusinessOrchestratorContext {
    const snapshot = BusinessFoundationService.getSnapshot()
    const user = userId ? snapshot.users.find((item) => item.id === userId) : snapshot.users[0]

    const wallet = user ? snapshot.wallets.find((item) => item.userId === user.id) : undefined
    const credits = user ? snapshot.creditAccounts.find((item) => item.userId === user.id) : undefined
    const subscription = user ? snapshot.subscriptions.find((item) => item.userId === user.id) : undefined
    const featureFlags = user ? snapshot.featureFlagsByUser[user.id] : undefined

    return {
      user,
      wallet: wallet
        ? {
            available: wallet.balance,
            reserved: 0,
            bonus: wallet.bonusBalance,
            total: Number((wallet.balance + wallet.bonusBalance).toFixed(2)),
          }
        : undefined,
      credits: credits
        ? {
            available: credits.available,
            reserved: credits.reserved,
            consumed: credits.consumed,
            refunded: credits.refunded,
          }
        : undefined,
      subscription,
      featureFlags,
      timeline: this.state.getTimeline(user?.id),
      events: this.events.list(user?.id),
      diagnostics: this.state.getDiagnostics(user?.id),
      health: this.state.getHealth(),
    }
  }
}
