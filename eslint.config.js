import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', '.vite', '**/.vite/**', '.claude/worktrees/**', '.tmp/**', '.wrangler/**'] },
  {
    files: ['functions/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.worker },
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Pure editor helpers exported only for their vitest suites (*.test.ts beside
    // each page) until the editors are split into forms modules.
    files: ['src/pages/admin/Admin{Products,Media,Settings,Leads}Page.tsx'],
    rules: {
      'react-refresh/only-export-components': ['warn', {
        allowConstantExport: true,
        allowExportNames: [
          'rowToProductForm', 'validateProductForm', 'validateModelForm', 'validateMaterialDefaultForm', 'validateSpecForm',
          'getProductPublishChecklist', 'getProductModelPublishChecklist',
          'validateMediaForm', 'getMediaPublishChecklist', 'mediaTypeFromMime', 'buildObjectPath', 'buildMediaExportCsv',
          'removePublicObjectIfUnreferenced', 'removePrivatePromotionSourceIfUnreferenced',
          'validateSettings', 'normalizeFooterColumns', 'serializeFooterColumns', 'validateAdminProfileForm', 'validateAdminInviteForm',
          'leadToForm', 'getWorkflowGuidance', 'getLeadWorkflowStatusSummary', 'buildLeadExportCsv',
        ],
      }],
    },
  },
)
