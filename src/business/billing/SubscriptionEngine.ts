import { BusinessFoundationService  } from '#/app/services/business/BusinessFoundationService'
import type {SubscriptionPlanName} from '#/app/services/business/BusinessFoundationService';
import type { ISubscriptionEngine } from '#/business/billing/interfaces'
import type { SubscriptionLifecycleResult } from '#/business/billing/types'

function resolvePlanIndex(plan: SubscriptionPlanName): number {
  const order: SubscriptionPlanName[] = ['Free', 'Starter', 'Professional', 'Business', 'Enterprise']
  return order.indexOf(plan)
}

export class SubscriptionEngine implements ISubscriptionEngine {
  subscribe(userId: string, planName: SubscriptionPlanName): SubscriptionLifecycleResult {
    const subscription = BusinessFoundationService.createSubscription({ userId, planName, status: 'active' })
    return { subscription, action: 'subscribe' }
  }

  renew(userId: string): SubscriptionLifecycleResult {
    const snapshot = BusinessFoundationService.getSnapshot()
    const current = snapshot.subscriptions.find((item) => item.userId === userId)
    const planName = current?.planName ?? 'Free'
    const subscription = BusinessFoundationService.createSubscription({ userId, planName, status: 'active' })
    return { subscription, previousPlan: current?.planName, action: 'renew' }
  }

  cancel(userId: string): SubscriptionLifecycleResult {
    const snapshot = BusinessFoundationService.getSnapshot()
    const current = snapshot.subscriptions.find((item) => item.userId === userId)
    const planName = current?.planName ?? 'Free'
    const subscription = BusinessFoundationService.createSubscription({ userId, planName, status: 'cancelled' })
    return { subscription, previousPlan: current?.planName, action: 'cancel' }
  }

  upgrade(userId: string, targetPlan: SubscriptionPlanName): SubscriptionLifecycleResult {
    const snapshot = BusinessFoundationService.getSnapshot()
    const current = snapshot.subscriptions.find((item) => item.userId === userId)
    const currentPlan = current?.planName ?? 'Free'
    if (resolvePlanIndex(targetPlan) <= resolvePlanIndex(currentPlan)) {
      throw new Error('Upgrade target must be above current subscription plan.')
    }

    const subscription = BusinessFoundationService.createSubscription({ userId, planName: targetPlan, status: 'active' })
    return { subscription, previousPlan: current?.planName, action: 'upgrade' }
  }

  downgrade(userId: string, targetPlan: SubscriptionPlanName): SubscriptionLifecycleResult {
    const snapshot = BusinessFoundationService.getSnapshot()
    const current = snapshot.subscriptions.find((item) => item.userId === userId)
    const currentPlan = current?.planName ?? 'Free'
    if (resolvePlanIndex(targetPlan) >= resolvePlanIndex(currentPlan)) {
      throw new Error('Downgrade target must be below current subscription plan.')
    }

    const subscription = BusinessFoundationService.createSubscription({ userId, planName: targetPlan, status: 'active' })
    return { subscription, previousPlan: current?.planName, action: 'downgrade' }
  }
}
