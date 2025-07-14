import globals from 'globals'
import pluginJs from '@eslint/js'
import tsEslint from 'typescript-eslint'
import tsEslintParser from '@typescript-eslint/parser'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginJest from 'eslint-plugin-jest'

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
      'dist/',
      '/tests/',
      'node_modules',
      'eslint.config.mjs'
    ]
  },
  {
    rules: {
      'no-console': 'error'
    }
  },
  {
    files: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}', 'tests/**/*.{js,ts}'],
    plugins: {
      jest: eslintPluginJest
    },
    rules: {
      ...eslintPluginJest.configs.recommended.rules,
      '@typescript-eslint/unbound-method': 'off',
      'no-console': ['off']
    }
  },
  eslintConfigPrettier
]
