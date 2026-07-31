import { BusinessFoundationService } from '#/app/services/business/BusinessFoundationService'
import type { ICouponEngine } from '#/business/billing/interfaces'
import type { CouponApplication } from '#/business/billing/types'

export class CouponEngine implements ICouponEngine {
  apply(code: string, subtotal: number): CouponApplication | null {
    const snapshot = BusinessFoundationService.getSnapshot()
    const coupon = snapshot.coupons.find(
      (item) => item.active && item.code.toLowerCase() === code.toLowerCase() && new Date(item.expiresAt).getTime() > Date.now(),
    )

    if (!coupon) {
      return null
    }

    const discountAmount = Number((subtotal * (coupon.discountPercent / 100)).toFixed(2))
    return {
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount,
    }
  }
}
