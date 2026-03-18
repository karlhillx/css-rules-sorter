import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginJest from 'eslint-plugin-jest';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { 
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'package-lock.json'] 
  },
  { 
    files: ['**/*.js', '**/*.mjs', '**/*.cjs', '**/*.ts'],
    languageOptions: { 
      globals: { ...globals.node, ...globals.jest },
      parser: tseslint.parser,
      parserOptions: {
        project: true,
      },
    } 
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
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
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    },
  },
];
