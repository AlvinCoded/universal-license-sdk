import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Universal License SDK',
  description:
    'Multi-language client SDK for license servers implementing the Universal License API',

  outDir: '../dist-docs',
  cacheDir: './.vitepress/cache',
  cleanUrls: true,
  ignoreDeadLinks: false,

  themeConfig: {
    logo: '/images/main.png',

    nav: [
      { text: 'Guide', link: '/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
      { text: 'Frameworks', link: '/frameworks/' },
      { text: 'Config', link: '/config/sdk-config' },
    ],

    sidebar: {
      '/api/': [
        {
          text: 'API',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Client', link: '/api/client' },
            { text: 'Validation', link: '/api/validation' },
            { text: 'Ownership & Invites', link: '/api/ownership' },
            { text: 'Types', link: '/api/types' },
            { text: 'Products', link: '/api/products' },
            { text: 'Plans', link: '/api/plans' },
            { text: 'Purchases', link: '/api/purchases' },
            { text: 'Renewals', link: '/api/renewals' },
            { text: 'Licenses (Admin)', link: '/api/licenses' },
            { text: 'Auth (Admin)', link: '/api/auth' },
            { text: 'Organizations (Admin)', link: '/api/organizations' },
            { text: 'Activity (Admin)', link: '/api/activity' },
            { text: 'Payments', link: '/api/payments' },
            { text: 'Import', link: '/api/import' },
            { text: 'Export', link: '/api/export' },
            { text: 'Health', link: '/api/health' },
          ],
        },
      ],

      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'What is this SDK?', link: '/guide/what-is-universal-license-sdk' },
            { text: 'Why use the SDK?', link: '/guide/why-use-sdk' },
            { text: 'Getting Started (Guide)', link: '/guide/getting-started' },
            { text: 'Core Concepts', link: '/guide/core-concepts' },
            { text: 'License Validation', link: '/guide/license-validation' },
            { text: 'Device Fingerprinting', link: '/guide/device-fingerprinting' },
            { text: 'Feature Gating', link: '/guide/feature-gating' },
            { text: 'Tier-Based Access', link: '/guide/tier-based-access' },
            { text: 'Caching Strategies', link: '/guide/caching-strategies' },
            { text: 'Offline Validation', link: '/guide/offline-validation' },
            { text: 'Error Handling', link: '/guide/error-handling' },
            { text: 'Purchase Workflow', link: '/guide/purchase-workflow' },
            { text: 'Renewal & Expiration', link: '/guide/renewal-and-expiration' },
            { text: 'Renewal Management', link: '/guide/renewal-management' },
          ],
        },
      ],

      '/installation/': [
        {
          text: 'Installation',
          items: [
            { text: 'Requirements', link: '/installation/requirements' },
            { text: 'JavaScript/TypeScript', link: '/installation/javascript' },
            { text: 'React', link: '/installation/react' },
            { text: 'PHP', link: '/installation/php' },
            { text: 'Laravel', link: '/installation/laravel' },
          ],
        },
      ],

      '/config/': [
        {
          text: 'Configuration',
          items: [
            { text: 'SDK Config', link: '/config/sdk-config' },
            { text: 'Environment', link: '/config/environment' },
            { text: 'Cache', link: '/config/cache' },
            { text: 'Timeout & Retries', link: '/config/timeout-retries' },
            { text: 'Debug', link: '/config/debug' },
          ],
        },
      ],

      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Basic Validation', link: '/examples/basic-validation' },
            { text: 'Onboarding Flow', link: '/examples/onboarding-flow' },
            { text: 'Dashboard Integration', link: '/examples/dashboard-integration' },
            { text: 'Payment Integration', link: '/examples/payment-integration' },
          ],
        },
      ],

      '/frameworks/': [
        {
          text: 'Frameworks',
          items: [
            { text: 'Overview', link: '/frameworks/' },
            { text: 'Vanilla JS', link: '/frameworks/vanilla-js' },
            { text: 'React', link: '/frameworks/react' },
            { text: 'Next.js', link: '/frameworks/nextjs' },
            { text: 'Vue', link: '/frameworks/vue' },
          ],
        },
      ],

      '/': [
        {
          text: 'Start Here',
          items: [
            { text: 'Home', link: '/' },
            { text: 'Getting Started', link: '/getting-started' },
            { text: 'Installation', link: '/installation' },
            { text: 'API Overview', link: '/api/' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Best Practices', link: '/best-practices' },
            { text: 'Troubleshooting', link: '/troubleshooting' },
            { text: 'FAQ', link: '/faq' },
            { text: 'Changelog', link: '/changelog' },
          ],
        },
      ],
    },

    socialLinks: [],

    footer: {
      message: 'Released under the MIT License.',
    },
  },
});
