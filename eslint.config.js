import eslint from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'

export default [
    {
        ignores: ['node_modules/**', 'lib/**', 'test/**', 'vitest.config.ts'],
    },
    eslint.configs.recommended,
    ...typescriptEslint.configs['flat/recommended'],
]
