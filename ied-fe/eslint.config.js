import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "require-jsdoc": "off",
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_", // Ignore variables starting with _
          argsIgnorePattern: "^_", // Ignore function arguments starting with _
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_", // Ignore variables starting with _
          argsIgnorePattern: "^_", // Ignore function arguments starting with _
        },
      ],
      "linebreak-style": "off",
      "object-curly-spacing": ["error", "always"],
      "new-cap": ["error", { newIsCap: false }],
      "comma-dangle": "off",
      "max-len": ["error", { code: 120 }],
      "no-console": "warn",
      "guard-for-in": "warn",
      camelcase: "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: ["**/*.d.ts", "node_modules", "dist", "build", "coverage"],
  },
];
