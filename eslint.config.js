import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    'curly': 'off',
    'antfu/if-newline': 'off',
    'n/prefer-global/process': 'off',
  },
})
