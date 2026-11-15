/*
 * Copyright (c) 2026 Abyssal Fragments
 * SPDX-License-Identifier: MIT
 */

import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import header from "eslint-plugin-simple-header";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";

import { Licenses, type SharedLicense } from "./license";
import { sharedIgnores, type SharedConfig } from "./shared";

export type EslintConfig = SharedConfig & {
  license?:
    | {
        text: string | string[];
      }
    | {
        file: string;
      }
    | {
        shared: SharedLicense;
      };
};

const defaultConfig: EslintConfig = Object.freeze({});
export default function eslint(config: EslintConfig = defaultConfig) {
  return defineConfig([
    globalIgnores([
      ...(config.extraIgnores ? config.extraIgnores : []),
      ...sharedIgnores.map((i) => `${i}/*`),
    ]),
    {
      files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
      plugins: {
        js,
        "unused-imports": unusedImports,
        header: header,
      },
      extends: [js.configs.recommended, eslintConfigPrettier, ts.configs.recommended],
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
                  : {
                      text:
                        "shared" in config.license
                          ? Licenses[config.license.shared]
                          : config.license.text,
                    },
              ],
            }
          : {}),
        "no-undef": "off",
        "no-redeclare": "off",
        "@typescript-eslint/no-redeclare": "error",
        "unused-imports/no-unused-imports": "error",
        // see: https://www.npmjs.com/package/eslint-plugin-unused-imports
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "unused-imports/no-unused-vars": [
          "warn",
          {
            vars: "all",
            varsIgnorePattern: "^_",
            args: "after-used",
            argsIgnorePattern: "^_",
          },
        ],

        // discord.js stuff
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
      },
    },
  ]);
}
