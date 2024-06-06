// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/**/*', 'build/**/*', 'public/lib/**/*'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/ban-types': [
        'error',
        {
          extendDefaults: true,
          types: {
            '{}': false,
          },
        },
      ],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_|context|attrs|req|res|next',
          varsIgnorePattern: '^_|o',
        },
      ],
      '@typescript-eslint/no-unused-expressions': 'off',
      'prefer-const': 'off',
      'prefer-rest-params': 'off',
      'no-constant-condition': 'warn',
    },
  },
)
