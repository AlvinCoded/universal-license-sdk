import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const require = createRequire(import.meta.url)
const legacyConfig = require('./.eslintrc.cjs')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  {
    ignores: [
      '**/node_modules/**',
      'pnpm-lock.yaml',

      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.tsbuildinfo',

      '**/*.config.js',
      '**/*.config.ts',
      'eslint.config.mjs',
      'rollup.config.js',
      'vite.config.ts',
      'vitest.config.ts',

      'scripts/**',
      'docs/.vitepress/**',
      'packages/*/examples/**',

      '**/*.test.ts',
      '**/*.test.tsx',
    ],
  },
  ...compat.config(legacyConfig),
]