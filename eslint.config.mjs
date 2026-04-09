import globals from 'globals'
import pluginJs from '@eslint/js'
import tsEslint from 'typescript-eslint'
import tsEslintParser from '@typescript-eslint/parser'
import eslintConfigPrettier from 'eslint-config-prettier'
import vitest from '@vitest/eslint-plugin'

export default [
  { files: ['**/*.{js,ts}'] },
  { languageOptions: { globals: globals.node, parser: tsEslintParser } },
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
  ...tsEslint.configs.stylistic,
  ...tsEslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  // ...tsEslint.configs.strictTypeChecked,
  // ...tsEslint.configs.stylisticTypeChecked,
  {
    ignores: [
      '.aws-sam',
      'coverage',
      'dist/',
      '/tests/',
      'node_modules',
      'eslint.config.mjs',
      'scripts/release-notes/generate.mjs'
    ]
  },
  {
    rules: {
      'no-console': 'error'
    }
  },
  {
    files: [
      '**/*.test.{js,ts}',
      '**/*.spec.{js,ts}',
      'tests/**/*.{js,ts}',
      'scripts/**/*.ts'
    ],
    plugins: {
      vitest: vitest
    },
    rules: {
      ...vitest.configs.recommended.rules,
      '@typescript-eslint/unbound-method': 'off',
      'no-console': ['off']
    }
  },
  eslintConfigPrettier
]
