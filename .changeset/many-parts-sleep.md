---
'@unilic/core': minor
'@unilic/client': minor
'@unilic/react': minor
---

- Add trial and public-plan APIs and wire them across the codebase:
- Core: new API endpoints for public product plans and purchases.start-trial; extend types (plans,
  payments, purchase responses) to include trial, quotas, gateways, and issued-license shapes.
- JS SDK: ProductModule uses encoded product codes and adds getPublicPlans; PaymentModule adds
  getSubscriptionLicense and waitForSubscriptionLicense (polling); PurchaseModule adds startTrial;
  add unit tests for PaymentModule.
- PHP: SubscriptionPlan model extended for billing, trials, allowedGateways and quotas;
  ProductModule and PurchaseModule use URL-encoded paths and expose public plans and startTrial
  methods.- React: usePurchase hook gains startTrial, tightens error typing, and uses Record<string,
  unknown> for metadata.
