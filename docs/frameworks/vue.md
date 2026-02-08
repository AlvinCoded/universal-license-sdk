# Vue 3 Integration

Complete guide to integrating the Universal License SDK with Vue 3 applications.

## Prerequisites

- Vue 3.0+
- Composition API support
- `@unilic/client` package installed

## Installation

```bash
npm install @unilic/client
# or
pnpm add @unilic/client
```

## Setup

### 1. Create a License Composable

```typescript
// src/composables/useLicense.ts
import { ref, onMounted } from 'vue';
import { LicenseClient, DeviceFingerprint } from '@unilic/client';
import type { License, ValidationResult } from '@unilic/client';

const client = new LicenseClient({
  baseUrl: import.meta.env.VITE_LICENSE_SERVER_URL,
  cache: true,
  debug: import.meta.env.DEV,
});

export function useLicense() {
  const license = ref<License | null>(null);
  const isValid = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function validate(licenseKey: string, requiredTier?: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await client.validate({
        licenseKey,
        deviceId: await DeviceFingerprint.generate(),
        requiredTier: requiredTier as any,
      });

      if (result.valid) {
        license.value = result.license;
        isValid.value = true;
      } else {
        error.value = result.error || 'License validation failed';
        isValid.value = false;
      }

      return result;
    } catch (err) {
      error.value = (err as Error).message;
      isValid.value = false;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  function hasFeature(feature: string): boolean {
    return license.value?.features?.[feature] ?? false;
  }

  function hasMinimumTier(tier: string): boolean {
    const tiers = ['free', 'standard', 'pro', 'enterprise'];
    return tiers.indexOf(license.value?.tier ?? '') >= tiers.indexOf(tier);
  }

  function isExpired(): boolean {
    if (!license.value) return true;
    return new Date(license.value.expiresAt) < new Date();
  }

  function daysUntilExpiration(): number {
    if (!license.value) return 0;
    const ms = new Date(license.value.expiresAt).getTime() - Date.now();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }

  onMounted(async () => {
    const stored = localStorage.getItem('licenseKey');
    if (stored) {
      await validate(stored);
    }
  });

  return {
    license,
    isValid,
    isLoading,
    error,
    validate,
    hasFeature,
    hasMinimumTier,
    isExpired,
    daysUntilExpiration,
    client,
  };
}
```

### 2. Create a Global Plugin (Optional)

```typescript
// src/plugins/license.ts
import { App } from 'vue';
import { useLicense } from '@/composables/useLicense';

export default {
  install(app: App) {
    app.provide('license', useLicense());
  },
};
```

```typescript
// src/main.ts
import { createApp } from 'vue';
import licensePlugin from '@/plugins/license';
import App from './App.vue';

createApp(App).use(licensePlugin).mount('#app');
```

## Usage Examples

### Basic License Validation

```vue
<template>
  <div>
    <div v-if="isLoading" class="loading">Validating license...</div>
    <div v-else-if="isValid" class="success">
      ✅ License Active
      <p>Tier: {{ license?.tier }}</p>
      <p>Expires: {{ expiresAt }}</p>
    </div>
    <div v-else class="error">
      ❌ {{ error }}
      <router-link to="/onboarding">Activate License</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLicense } from '@/composables/useLicense';

const { license, isValid, isLoading, error } = useLicense();

const expiresAt = computed(() => {
  return new Date(license.value?.expiresAt ?? '').toLocaleDateString();
});
</script>

<style scoped>
.loading {
  color: blue;
}
.success {
  color: green;
}
.error {
  color: red;
}
</style>
```

### Feature-Gated Components

```vue
<template>
  <div>
    <!-- Show for all licensed users -->
    <section v-if="isValid" class="premium-features">
      <h2>Premium Features</h2>

      <!-- Feature-specific gating -->
      <div v-if="hasFeature('advancedReporting')" class="feature">
        <h3>Advanced Reporting</h3>
        <button @click="generateReport">Generate Report</button>
      </div>

      <!-- Tier-based gating -->
      <div v-if="hasMinimumTier('pro')" class="feature">
        <h3>API Access</h3>
        <a href="/api-docs">View API Docs</a>
      </div>
    </section>

    <!-- Show upgrade prompt for unlicensed -->
    <section v-else class="upgrade">
      <h2>Unlock Premium Features</h2>
      <router-link to="/pricing">View Plans</router-link>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useLicense } from '@/composables/useLicense';

const { isValid, hasFeature, hasMinimumTier } = useLicense();

async function generateReport() {
  // Generate report implementation
}
</script>
```

### Renewal Notification

```vue
<template>
  <div v-if="showRenewalBanner" class="renewal-banner">
    <span v-if="daysLeft > 0">
      ⏰ Your license expires in <strong>{{ daysLeft }} days</strong>
    </span>
    <span v-else class="expired"> ⚠️ Your license has expired </span>
    <button @click="startRenewal">Renew Now</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLicense } from '@/composables/useLicense';

const { license, daysUntilExpiration } = useLicense();

const daysLeft = computed(() => daysUntilExpiration());

const showRenewalBanner = computed(() => {
  const days = daysLeft.value;
  return days >= 0 && days <= 30; // Show 30 days before expiry
});

async function startRenewal() {
  // Implement renewal flow
  window.location.href = '/renew';
}
</script>

<style scoped>
.renewal-banner {
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expired {
  color: #dc3545;
}
</style>
```

### Protected Routes

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { useLicense } from '@/composables/useLicense';

const routes = [
  {
    path: '/dashboard',
    component: () => import('@/pages/Dashboard.vue'),
    meta: { requiresLicense: true, requiredTier: 'standard' },
  },
  {
    path: '/reports',
    component: () => import('@/pages/Reports.vue'),
    meta: { requiresLicense: true, requiredFeature: 'advancedReporting' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresLicense) {
    const { isValid, hasFeature, hasMinimumTier } = useLicense();

    if (!isValid.value) {
      return next('/onboarding');
    }

    if (to.meta.requiredTier && !hasMinimumTier(to.meta.requiredTier as string)) {
      return next('/upgrade');
    }

    if (to.meta.requiredFeature && !hasFeature(to.meta.requiredFeature as string)) {
      return next('/upgrade');
    }
  }

  next();
});

export default router;
```

### Purchase Flow

```vue
<template>
  <div class="purchase-flow">
    <div v-if="step === 'plans'" class="plans-list">
      <div v-for="plan in plans" :key="plan.code" class="plan-card">
        <h3>{{ plan.name }}</h3>
        <p>${{ plan.price }}</p>
        <button @click="selectPlan(plan)">Select Plan</button>
      </div>
    </div>

    <div v-if="step === 'onboarding'" class="onboarding-form">
      <form @submit.prevent="createOrder">
        <input v-model="formData.orgName" placeholder="Organization Name" />
        <input v-model="formData.ownerName" placeholder="Your Name" />
        <input v-model="formData.ownerEmail" type="email" placeholder="Email" />
        <button type="submit" :disabled="isProcessing">
          {{ isProcessing ? 'Processing...' : 'Continue to Payment' }}
        </button>
      </form>
    </div>

    <div v-if="step === 'success'" class="success-message">
      ✅ License Created: {{ newLicenseKey }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLicense } from '@/composables/useLicense';

const { client } = useLicense();

const step = ref<'plans' | 'onboarding' | 'success'>('plans');
const plans = ref([]);
const isProcessing = ref(false);
const newLicenseKey = ref('');

const formData = ref({
  orgName: '',
  ownerName: '',
  ownerEmail: '',
});

let selectedPlanCode = '';

onMounted(async () => {
  plans.value = await client.plans.getByProduct('YOUR_PRODUCT_CODE');
});

async function selectPlan(plan: any) {
  selectedPlanCode = plan.code;
  step.value = 'onboarding';
}

async function createOrder() {
  isProcessing.value = true;
  try {
    const order = await client.purchases.createOrder({
      planCode: selectedPlanCode,
      organizationData: formData.value,
    });

    // Redirect to payment (implementation-specific)
    window.location.href = `/payment?orderId=${order.orderId}`;
  } catch (error) {
    alert('Order creation failed: ' + (error as Error).message);
  } finally {
    isProcessing.value = false;
  }
}
</script>
```

## Environment Variables

```env
# .env.local
VITE_LICENSE_SERVER_URL=https://license.yourdomain.com/api
VITE_APP_TITLE=My App
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
});
```

## Error Handling

```vue
<template>
  <div v-if="error" class="error-alert" role="alert">
    <strong>Error:</strong> {{ error }}
    <button @click="retry">Retry</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLicense } from '@/composables/useLicense';

const { error, validate } = useLicense();

async function retry() {
  const licenseKey = localStorage.getItem('licenseKey');
  if (licenseKey) {
    await validate(licenseKey);
  }
}
</script>
```

## Offline Support

```typescript
// src/composables/useOfflineLicense.ts
import { useLicense } from './useLicense';

export function useOfflineLicense() {
  const { license, client } = useLicense();

  async function validateOffline(signature: string) {
    const { verifySignature } = await import('@unilic/core');

    if (!license.value) return false;

    try {
      const publicKey = await client.validation.getPublicKey();

      return verifySignature(
        JSON.stringify({
          licenseKey: license.value.licenseKey,
          timestamp: Math.floor(Date.now() / 1000),
        }),
        signature,
        publicKey
      );
    } catch (error) {
      console.error('Offline validation failed:', error);
      return false;
    }
  }

  return { validateOffline };
}
```

## Performance Tips

1. **Validate once per session** — store result in localStorage
2. **Use computed properties** — for reactive feature checks
3. **Lazy load protected components** — with `<Suspense>`
4. **Cache license data** — SDK caches automatically
5. **Handle offline gracefully** — always provide fallback UI

## Testing

```typescript
// src/__tests__/useLicense.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { useLicense } from '@/composables/useLicense';

describe('useLicense', () => {
  it('validates license successfully', async () => {
    const { validate, isValid } = useLicense();

    // Mock the client
    vi.mock('@unilic/client');

    await validate('TEST-LICENSE-KEY');
    expect(isValid.value).toBe(true);
  });
});
```

## Troubleshooting

### License not persisting after refresh

→ Check localStorage is enabled → Verify `useOnMounted` hook runs → Check browser console for errors

### Features not updating

→ Use `computed` properties for reactivity → Call `validate()` again after updates → Check network
tab for failed requests

### Build issues with TypeScript

→ Ensure TypeScript 4.7+ is installed → Check `tsconfig.json` has proper module settings → Run
`npm run build` to check for errors

## See Also

- [React Integration](/frameworks/react)
- [License Validation](/guide/license-validation)
- [Feature Gating](/guide/feature-gating)
- [Installation](/installation/javascript)
- [API Reference](/api/client)
