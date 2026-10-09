import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'
import autoImportGlobals from './.eslintrc-auto-import.json' with { type: 'json' }

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'public/**',
      '*.d.ts',
      'auto-imports.d.ts',
      'components.d.ts',
      '.eslintrc-auto-import.json',
      'pnpm-lock.yaml',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
    },
  },
  {
    files: ['**/*.{ts,mjs,js}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...autoImportGlobals.globals,
      },
    },
  },
  {
    rules: {
      // Enforce <script setup> for all .vue files
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'off',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
  prettierConfig,
]
