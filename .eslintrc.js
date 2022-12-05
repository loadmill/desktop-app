module.exports = {
  env: {
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:import/recommended',
    'plugin:react/recommended',
    'plugin:typescript-sort-keys/recommended',
    'react-app',
  ],
  globals: {
    chrome: 'readonly',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'error',
      }
    },
    {
      files: ['*.tsx'],
      rules: {
        '@typescript-eslint/prefer-as-const': 'off',
      },
    },
    {
      env: {
        mocha: true,
      },
      files: '*.spec.*',
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'unused-imports',
    'import',
    'typescript-sort-keys',
  ],
  root: true,
  rules: {
    '@typescript-eslint/ban-ts-comment': 'error',
    '@typescript-eslint/ban-types': [
      'error',
      {
        extendDefaults: false,
        types: {
          Boolean: 'Avoid using the `Boolean` type. Did you mean `boolean`?',
          Number: 'Avoid using the `Number` type. Did you mean `number`?',
          Object: 'Avoid using the `Object` type. Did you mean `object`?',
          String: 'Avoid using the `String` type. Did you mean `string`?',
          Symbol: 'Avoid using the `Symbol` type. Did you mean `symbol`?',
        },
      },
    ],
    '@typescript-eslint/no-array-constructor': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/no-var-requires': 'off',
    'brace-style': ['error'],
    'comma-spacing': ['error', { 'after': true, 'before': false, }],
    'comma-style': ['error', 'last'],
    'curly': ['error'],
    'eol-last': ['error'],
    'eslint-comments/no-use': 'error',
    'import/newline-after-import': 'error',
    'import/no-unresolved': 'off',
    'import/order': ['error', {
      'alphabetize': {
        'caseInsensitive': true,
        'order': 'asc',
      },
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      'warnOnUnassignedImports': true,
    }
    ],
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'keyword-spacing': ['error'],
    'max-classes-per-file': ['error', 10],
    'max-len': ['error', 200],
    'no-console': 'warn',
    'no-empty': 'off',
    'no-multi-spaces': ['error'],
    'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 0 }],
    'no-prototype-builtins': 'off',
    'no-trailing-spaces': 'error',
    'no-use-before-define': 'off',
    'no-var': 'error',
    'object-curly-spacing': ['error', 'always'],
    'prefer-const': ['error', { destructuring: 'all', },],
    'quotes': ['error', 'single'],
    'react/boolean-prop-naming': ['error', { 'validateNested': true }],
    'react/destructuring-assignment': 'error',
    'react/display-name': 'off',
    'react/jsx-closing-bracket-location': 2,
    'react/jsx-closing-tag-location': 'error',
    'react/jsx-curly-newline': ['error',
      {
        multiline: 'consistent',
        singleline: 'consistent'
      }
    ],
    'react/jsx-curly-spacing': [
      'error',
      {
        when: 'always',
        // allowMultiline: true,
      },
    ],
    'react/jsx-equals-spacing': 'error',
    'react/jsx-first-prop-new-line': ['error', 'multiline',],
    'react/jsx-fragments': 'error',
    'react/jsx-indent': ['error', 2],
    'react/jsx-key': 'off',
    'react/jsx-max-depth': ['error', { 'max': 5 }],
    'react/jsx-max-props-per-line': [
      2,
      {
        maximum: 1,
      },
    ],
    'react/jsx-no-target-blank': 'off',
    'react/jsx-props-no-multi-spaces': 'error',
    'react/jsx-sort-props': [
      'error',
      {
        // "callbacksLast": true,
        // "shorthandFirst": true,
        // "shorthandLast": true,
        // "multiline": "ignore" | "first" | "last",
        // "ignoreCase": true,
        // "noSortAlphabetically": true,
        // "reservedFirst": true,
      },
    ],
    'react/no-adjacent-inline-elements': 'error',
    'react/no-unescaped-entities': 'off',
    'react/no-unused-prop-types': 'error',
    'react/prop-types': 'off',
    'semi': ['error', 'always'],
    'sort-imports': ['error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      // ignoreMemberSort: true,
      // allowSeparatedGroups: true
      }
    ],
    'sort-keys': 'error',
    'sort-vars': 'error',
    'space-before-blocks': 'error',
    'space-infix-ops': 'error',
    'unused-imports/no-unused-imports': 'error',
  },
  settings: {
    'import/ignore': [ /@mui\/material/ ],
    react: {
      version: 'detect',
    },
  },
};
