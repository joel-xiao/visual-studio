import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/packages/web/src/assets/style/font/**',
      'packages/web/dist/**',
      'packages/electron/dist/**',
      'packages/electron/release/**',
      'packages/tauri/target/**',
      'packages/tauri/gen/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/essential'],
  ...vue.configs['flat/strongly-recommended'],
  ...vue.configs['flat/recommended'],
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        crypto: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        NodeJS: 'readonly'
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      vue,
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/component-definition-name-casing': 'off',
      'vue/no-v-html': 'warn',
      'vue/no-required-prop-with-default': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'warn',
      'vue/require-v-for-key': 'error',
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'never',
            component: 'always'
          },
          svg: 'always',
          math: 'always'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/ban-ts-comment': 'error',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-redeclare': 'error',
      'no-self-assign': 'error'
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {}
  },
  {
    files: ['**/*.cjs', '**/*.js'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'script'
      },
      globals: {
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off'
    }
  },
  {
    files: ['config/**/*.ts', 'scripts/**/*.ts'],
    languageOptions: {
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly'
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'script'
      }
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ]
    }
  }
);

