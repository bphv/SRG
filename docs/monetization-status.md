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

## Compteur d'abonnement (frontend)

| Élément | Statut |
|---|---|
| SubscriptionCounterService (lecture seule) | IMPLEMENTED |
| Affichage compteur dans AppShell (plan + jours restants + tooltip) | IMPLEMENTED |
| Statut 'paused' affiché comme 'Suspendu' | IMPLEMENTED |
| Modification par frontend utilisateur | INTERDIT (aucun champ éditable) |

Le compteur est dérivé uniquement de `UserSubscription.renewalAt - now`.
Aucune donnée d'abonnement n'est modifiable par le frontend utilisateur.

## Actions admin sur les abonnements

| Action | Méthode | Audit |
|---|---|---|
| Prolonger (+N jours) | BusinessFoundationService.adminAdjustSubscriptionDays | observe('subscription.admin.adjust') |
| Réduire (-N jours) | BusinessFoundationService.adminAdjustSubscriptionDays (négatif) | observe('subscription.admin.adjust') |
| Suspendre | BusinessFoundationService.adminSuspendSubscription | observe('subscription.admin.suspend') |
| Réactiver | BusinessFoundationService.adminReactivateSubscription | observe('subscription.admin.reactivate') |

Ces actions sont réservées aux rôles SuperAdmin/Admin (vérification dans
SubscriptionCounterService.assertAdmin). Elles sont exposées dans /administration
(section "Gestion Admin des Abonnements"). Chaque action écrit dans logs/events/traces.

## PaymentEngine — détail du branchement

| Élément | Statut |
|---|---|
| PaymentEngine (src/business/billing/PaymentEngine.ts) | IMPLEMENTED (logique complète) |
| StubPaymentGateway interne | SIMULATED (mode: 'stub' déclaré) |
| Usage dans src/app / src/routes | NOT CONNECTED (aucune UI de paiement branchée) |
| recordPayment via BusinessFoundationService | SIMULATED (utilisé par /administration) |

Le flux actuellement visible dans /administration ("Créer facture + paiement")
passe directement par BusinessFoundationService.recordPayment (paiement simulé).
PaymentEngine est opérationnel quand une UI de paiement sera branchée, mais
n'est PAS connecté à une passerelle réelle.
