import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginJest from 'eslint-plugin-jest';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.js', '**/*.mjs', '**/*.cjs'] },
  { languageOptions: { globals: { ...globals.node, ...globals.jest } } },
  pluginJs.configs.recommended,
  {
    plugins: {
      jest: pluginJest,
    },
    rules: {
      ...pluginJest.configs.recommended.rules,
      'no-console': 'warn',
      'indent': ['error', 2],
      'quotes': ['error', 'single', { 'allowTemplateLiterals': true, 'avoidEscape': true }],
      'semi': ['error', 'always'],
    },
  },
];
