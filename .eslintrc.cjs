// ESLint legacy config (eslint 8). Aturan di bawah bersifat wajib (error).
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'jsx-a11y'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:jsx-a11y/recommended'],
  ignorePatterns: ['dist', 'node_modules', '.turbo'],
  rules: {
    // Tipe salah dideteksi tsc (typecheck) — ESLint tidak mengerti TS semantic, jadi matikan no-undef.
    'no-undef': 'off',
    // Di repo ini kita proaktif: 0 `any`, nol @ts-ignore, 0 TODO/FIXME.
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/ban-ts-comment': 'error',
    'no-warning-comments': ['error', { terms: ['todo', 'fixme'], location: 'start' }],
    // Aksesibilitas adalah syarat legal (WCAG 2.1 AA), bukan opsional.
    'jsx-a11y/label-has-associated-control': ['error', { labelComponents: [], controlComponents: [] }],
  },
  overrides: [
    {
      files: ['**/*.config.*', '**/.eslintrc.*', '**/prettier.config.*'],
      env: { node: true },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-undef': 'off',
      },
    },
    {
      // Test & config file boleh memakai API Node/bun tanpa flag global.
      files: ['**/*.test.*', '**/vitest.config.*'],
      env: { node: true },
    },
  ],
};