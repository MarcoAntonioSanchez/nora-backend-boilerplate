import js from '@eslint/js';
import globals from 'globals';

export default [
  // Ignorar archivos y directorios generados.
  {
    ignores: ['node_modules/**', 'coverage/**', 'dist/**'],
  },

  // Reglas recomendadas para JavaScript.
  js.configs.recommended,

  {
    files: ['**/*.js'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },

    rules: {
      // Evitar variables declaradas que nunca se utilizan.
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
];
