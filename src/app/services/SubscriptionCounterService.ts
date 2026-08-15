/**
 * SubscriptionCounterService — compteur de jours restants d'abonnement.
 *
 * Derive uniquement de UserSubscription.renewalAt - now.
 * Aucune modification frontend des donnees d'abonnement : lecture seule.
 * Les actions admin (prolonger/reduire/suspendre/reactiver) passent par
 * BusinessFoundationService (backend simule) avec audit.
 */

import { BusinessFoundationService } from '#/app/services/business/BusinessFoundationService'
import type { UserSubscription } from '#/app/services/business/BusinessFoundationService'

export type SubscriptionCounter = {
  subscriptionId: string
  userId: string
  planName: string
  status: UserSubscription['status']
  startedAt: string
  renewalAt: string
  daysRemaining: number
  isExpired: boolean
  isExpiringSoon: boolean
  label: string
}

const EXPIRING_SOON_THRESHOLD_DAYS = 7

export class SubscriptionCounterService {
  /**
   * Calcule le compteur pour un utilisateur. Lecture seule.
   */
  static getCounter(userId: string): SubscriptionCounter | null {
    const snapshot = BusinessFoundationService.getSnapshot()
    const subscription = snapshot.subscriptions.find((item) => item.userId === userId)
    if (!subscription) return null
    return this.buildCounter(subscription)
  }

  /**
   * Calcule le compteur a partir d'un abonnement deja charge.
   */
  static buildCounter(subscription: UserSubscription): SubscriptionCounter {
    const now = Date.now()
    const renewalTime = new Date(subscription.renewalAt).getTime()
    const diffMs = renewalTime - now
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    const isExpired = diffMs <= 0 || subscription.status !== 'active'
    const isExpiringSoon = !isExpired && daysRemaining <= EXPIRING_SOON_THRESHOLD_DAYS

    let label: string
    if (subscription.status === 'paused') {
      label = 'Suspendu'
    } else if (subscription.status === 'cancelled') {
      label = 'Annule'
    } else if (isExpired) {
      label = 'Expire'
    } else if (daysRemaining <= 1) {
      label = 'Dernier jour'
    } else {
      label = `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`
    }

    return {
      subscriptionId: subscription.id,
      userId: subscription.userId,
      planName: subscription.planName,
      status: subscription.status,
      startedAt: subscription.startedAt,
      renewalAt: subscription.renewalAt,
      daysRemaining: Math.max(0, daysRemaining),
      isExpired,
      isExpiringSoon,
      label,
    }
  }

  /**
   * Formate la date de renouvellement pour affichage.
   */
  static formatRenewalDate(isoDate: string): string {
    try {
      return new Date(isoDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return isoDate
    }
  }

  /**
   * Formate la date de debut pour affichage.
   */
  static formatStartDate(isoDate: string): string {
    return this.formatRenewalDate(isoDate)
  }

  // ============================================================
  // ACTIONS ADMIN — reservees aux roles SuperAdmin / Admin.
  // Ces methodes deleguent a BusinessFoundationService qui
  // verifie les droits et ecrit l'audit (logs/events/traces).
  // Le frontend utilisateur ne peut JAMAIS modifier un abonnement.
  // ============================================================

  /**
   * Verifie que l'operateur est administrateur avant toute action.
   */
  private static assertAdmin(adminId: string): void {
    const snapshot = BusinessFoundationService.getSnapshot()
    const admin = snapshot.users.find((item) => item.id === adminId)
    if (!admin || (admin.role !== 'SuperAdmin' && admin.role !== 'Admin')) {
      throw new Error('SUBSCRIPTION_ADMIN_FORBIDDEN: only SuperAdmin/Admin can manage subscriptions.')
    }
  }

  /**
   * ADMIN — prolonge l'abonnement de N jours.
   */
  static adminExtend(userId: string, adminId: string, days: number): SubscriptionCounter {
    this.assertAdmin(adminId)
    if (!Number.isInteger(days) || days <= 0) {
      throw new Error('Extension days must be a positive integer.')
    }
    const updated = BusinessFoundationService.adminAdjustSubscriptionDays({ userId, adminId, days })
    return this.buildCounter(updated)
  }

  /**
   * ADMIN — reduit l'abonnement de N jours.
   */
  static adminReduce(userId: string, adminId: string, days: number): SubscriptionCounter {
    this.assertAdmin(adminId)
    if (!Number.isInteger(days) || days <= 0) {
      throw new Error('Reduction days must be a positive integer.')
    }
    const updated = BusinessFoundationService.adminAdjustSubscriptionDays({ userId, adminId, days: -days })
    return this.buildCounter(updated)
  }

  /**
   * ADMIN — suspend l'abonnement (status = paused).
   */
  static adminSuspend(userId: string, adminId: string, reason?: string): SubscriptionCounter {
    this.assertAdmin(adminId)
    const updated = BusinessFoundationService.adminSuspendSubscription({ userId, adminId, reason })
    return this.buildCounter(updated)
  }

  /**
   * ADMIN — reactive un abonnement suspendu.
   */
  static adminReactivate(userId: string, adminId: string): SubscriptionCounter {
    this.assertAdmin(adminId)
    const updated = BusinessFoundationService.adminReactivateSubscription({ userId, adminId })
    return this.buildCounter(updated)
  }

  /**
   * ADMIN — liste tous les compteurs (vue administration).
   */
  static listAllCounters(): SubscriptionCounter[] {
    const snapshot = BusinessFoundationService.getSnapshot()
    return snapshot.subscriptions.map((subscription) => this.buildCounter(subscription))
  }
}
