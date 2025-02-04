import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // Automatically remove unused imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used' },
      ],
      // Disable @typescript-eslint version for imports
      '@typescript-eslint/no-unused-vars': 'off',

      "react/no-unescaped-entities": "error",
    },
    ignores: ["**/*.svg", "**/sui-graphql-queries.ts" ], // Ignore all .svg files
  },
];

export default eslintConfig;
