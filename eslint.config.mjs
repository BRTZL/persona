import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Strict TypeScript rules
  {
    rules: {
      // Disallow any type
      "@typescript-eslint/no-explicit-any": "error",

      // Disallow unsafe type assertions (as any, as never, as unknown)
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        {
          assertionStyle: "as",
          objectLiteralTypeAssertions: "never",
        },
      ],

      // Disallow non-null assertions (!)
      "@typescript-eslint/no-non-null-assertion": "error",

      // Prefer type over interface
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],

      // Enforce consistent type imports
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      // Disallow unused variables (error, not warning)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // Require explicit return types on functions
      "@typescript-eslint/explicit-function-return-type": "off",

      // Prefer nullish coalescing
      "@typescript-eslint/prefer-nullish-coalescing": "off",

      // React rules
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",

      // Import rules
      "import/order": "off", // Handled by Prettier plugin
      "import/no-duplicates": "error",
    },
  },

  // Relax rules for generated UI components (shadcn)
  {
    files: ["components/ui/**/*.tsx"],
    rules: {
      "@typescript-eslint/consistent-type-assertions": "off",
    },
  },

  // Prettier config (must be last to override other formatting rules)
  eslintConfigPrettier,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "node_modules/**",
    "next-env.d.ts",
    "*.config.js",
    "*.config.mjs",
  ]),
]);

export default eslintConfig;
