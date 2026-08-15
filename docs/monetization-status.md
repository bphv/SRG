# SRG — STATUT MONÉTISATION

Conformément à la mission, le système de monétisation existant est CONSERVÉ.
Aucune suppression. Voici l'état exact par composant.

## Moteurs business (src/business)

| Composant | Fichier | Statut |
|---|---|---|
| WalletEngine | src/business/wallet/WalletEngine.ts | IMPLEMENTED (logique wallet complète) |
| WalletService / Validator | src/business/wallet/ | IMPLEMENTED |
| CreditEngine / Calculator / Validator | src/business/credits/ | IMPLEMENTED |
| BillingEngine | src/business/billing/BillingEngine.ts | IMPLEMENTED |
| InvoiceEngine | src/business/billing/InvoiceEngine.ts | IMPLEMENTED |
| SubscriptionEngine | src/business/billing/SubscriptionEngine.ts | IMPLEMENTED (abonnements) |
| CouponEngine | src/business/billing/CouponEngine.ts | IMPLEMENTED |
| TaxCalculator | src/business/billing/TaxCalculator.ts | IMPLEMENTED |
| PaymentEngine | src/business/billing/PaymentEngine.ts | SIMULATED (paiements simulés) |

## Passerelles de paiement

| Élément | Statut |
|---|---|
| Passerelle réelle (Stripe/Mobile Money/etc.) | NOT CONNECTED |
| Webhooks paiement | NOT CONNECTED |
| Paiement production | NOT PRODUCTION READY |

## Synthèse

- IMPLEMENTED : wallet, crédits, facturation, abonnements (moteur), coupons, taxes.
- SIMULATED : exécution des paiements (PaymentEngine en mode simulé).
- NOT CONNECTED : passerelle de paiement externe, webhooks.
- PRODUCTION READY : aucun flux de paiement réel ne doit être exposé en production
  tant qu'une passerelle certifiée n'est pas connectée.

Le système de crédits/wallet est utilisé par les conversations (quota, wallet, credits
affichés dans ConversationWorkspaceService) et par l'authentification (UserProfileSnapshot
wallet/credits/plan). Il reste fonctionnel en mode simulé.