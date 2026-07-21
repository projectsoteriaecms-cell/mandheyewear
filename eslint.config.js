import fs from "node:fs";
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// Modular monolith boundary enforcement: every module under src/modules/*
// exposes a public API through its index.ts. Reaching into
// @/modules/<name>/hooks|components|lib|pages|types bypasses that boundary
// the same way a deep import into another package's internals would —
// including from a module's OWN files, which use relative imports instead.
// Derived from the directory listing so a new module is covered
// automatically, with no config edit required.
//
// One rule, one config object: ESLint flat config does not merge
// array-valued rule options across multiple matching configs — the last
// one silently wins — so per-module config objects each setting
// no-restricted-imports would only enforce whichever module lint visits
// last. Combining every module's pattern into a single "patterns" array
// avoids that trap.
const MODULES = fs
  .readdirSync(new URL("./src/modules", import.meta.url), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

const moduleBoundaryRules = [
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: MODULES.map((name) => ({
            group: [`@/modules/${name}/*`, `@/modules/${name}/**`],
            message: `Import from "@/modules/${name}" instead of a deep path — deep imports bypass the module's public API (see @/modules/${name}/index.ts).`,
          })),
        },
      ],
    },
  },
];

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  ...moduleBoundaryRules,
);
