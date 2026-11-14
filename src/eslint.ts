/*
 * Copyright (c) 2026 Abyssal Fragments
 * SPDX-License-Identifier: MIT
 */

import js from "@eslint/js";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import header from "eslint-plugin-simple-header";
import eslintConfigPrettier from "eslint-config-prettier/flat";
type EslintConfigLicense =
  | {
      text: string | string[];
    }
  | {
      file: string;
    };
export type EslintConfig = {
  discord?: boolean;
  license?: EslintConfigLicense;
};

const defaultConfig: EslintConfig = Object.freeze({});
export default function eslint(config: EslintConfig = defaultConfig) {
  return defineConfig([
    globalIgnores(["dist/*"]),
    tseslint.configs.recommended,
    {
      files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
      plugins: {
        js,
        "unused-imports": unusedImports,
        header: header,
      },
      extends: [js.configs.recommended, eslintConfigPrettier],
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.nodeBuiltin,
        },
      },
      rules: {
        ...(config.license
          ? {
              "header/header": [
                "error",
                "file" in config.license
                  ? {
                      files: [config.license.file],
                    }
                  : { text: config.license.text },
              ],
            }
          : {}),
        "no-undef": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "no-redeclare": "off",
        "@typescript-eslint/no-redeclare": "error",
        "no-unused-vars": "off",
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": [
          "warn",
          {
            vars: "all",
            varsIgnorePattern: "^_",
            args: "after-used",
            argsIgnorePattern: "^_",
          },
        ],
        ...(config.discord
          ? {
              "no-restricted-imports": [
                "error",
                {
                  paths: [
                    {
                      name: "discord.js",
                      importNames: ["Colors"],
                      message: "Use StyledColors instead",
                    },
                  ],
                },
              ],
              "no-restricted-syntax": [
                "error",
                {
                  selector: "Literal[raw=/^0x/i]",
                  message: "Use StyledColors instead",
                },
              ],
            }
          : {}),
      },
    },
  ]);
}
