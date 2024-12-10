import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "react/react-in-jsx-scope": "off",
      "require-jsdoc": "off",
      "no-unused-vars": ["warn"],
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
    ignores: ["node_modules", "dist", "build", "coverage"],
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  pluginReact.configs.flat["jsx-runtime"],
];
