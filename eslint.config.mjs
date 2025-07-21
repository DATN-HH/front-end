import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      '.git/**',
      'coverage/**',
      '*.config.js',
      '*.config.mjs',
      'public/**',
      '.vscode/**',
      '.idea/**',
      'src/components/ui/**'
    ]
  },

  // Main configuration using extends for maximum compatibility
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier'
  ),

  // Custom rules configuration
  ...compat.config({
    env: {
      browser: true,
      es2021: true,
      node: true
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      },
      project: './tsconfig.json'
    },
    plugins: [
      'react',
      'react-hooks',
      'jsx-a11y',
      'prettier',
      'unused-imports',
      '@typescript-eslint',
      'import'
    ],
    settings: {
      react: {
        version: 'detect'
      }
    },
    globals: {
      React: 'readonly',
      JSX: 'readonly',
      NodeJS: 'readonly'
    },
    rules: {
      // ==================== PRETTIER ====================
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          semi: true,
          trailingComma: 'es5',
          printWidth: 80,
          tabWidth: 2,
          useTabs: false,
          endOfLine: 'auto'
        }
      ],

      // ==================== IMPORTS & UNUSED ====================
      'unused-imports/no-unused-imports': 'error',
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external', 
            'internal',
            'parent',
            'sibling',
            'index'
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ],
      'import/no-duplicates': 'error',

      // ==================== TYPESCRIPT ====================
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',

      // ==================== REACT ====================
      'react/react-in-jsx-scope': 'off', // Next.js auto imports
      'react/prop-types': 'off', // TypeScript handles this
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',

      // ==================== REACT HOOKS ====================
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ==================== NEXT.JS ====================
      '@next/next/no-img-element': 'warn',
      '@next/next/no-html-link-for-pages': 'off',

      // // ==================== ACCESSIBILITY ====================
      // 'jsx-a11y/alt-text': 'warn',
      // 'jsx-a11y/anchor-has-content': 'warn',
      // 'jsx-a11y/anchor-is-valid': 'warn',
      // 'jsx-a11y/click-events-have-key-events': 'warn',
      // 'jsx-a11y/no-static-element-interactions': 'warn',

      // ==================== GENERAL CODE QUALITY ====================
      'no-unused-vars': 'off', // Handled by TypeScript ESLint
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'warn',
      'prefer-template': 'warn',
      'array-callback-return': 'error',
      'no-param-reassign': 'warn',

      // ==================== CODE STYLE ====================
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true }],
      'comma-dangle': [
        'warn',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'never'
        }
      ],
      'eol-last': ['warn', 'always'],
      'no-trailing-spaces': 'warn',

      // ==================== SECURITY ====================
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',

      // ==================== COMPATIBILITY ====================
      'no-undef': 'off', // TypeScript handles this
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: ['../*', '../../*', '../../../*'],
              message: 'Please use absolute imports instead of relative imports with more than one level up'
            }
          ]
        }
      ]
    }
  }),

  // Override for config files
  {
    files: ['*.config.{js,mjs,ts}', '*.{js,mjs}'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-console': 'off'
    }
  },

  // Override for test files
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
];

export default eslintConfig;