/*
 * Copyright (c) 2026 Abyssal Fragments
 * SPDX-License-Identifier: MIT
 */

import { abort } from "node:process";

import { defineConfig, type OxlintEnv } from "oxlint";

import { Licenses, type SharedLicense } from "./license";
import { sharedIgnores, type SharedConfig } from "./shared";

export type OxlintConfig = SharedConfig & {
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
  env?: OxlintEnv;
};
const defaultConfig: OxlintConfig = Object.freeze({});
export default function oxlint(config: OxlintConfig = defaultConfig) {
  return defineConfig({
    ignorePatterns: [
      ...(config.extraIgnores ? config.extraIgnores : []),
      ...sharedIgnores.map((i) => `${i}/*`),
    ],
    jsPlugins: [
      {
        name: "eslint-js",
        specifier: "oxlint-plugin-eslint",
      },
      config.license
        ? {
            name: "header",
            specifier: "eslint-plugin-simple-header",
          }
        : null,
    ].filter((i) => i !== null),
    env: config.env ?? {
      node: true,
      es6: true,
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
      "no-redeclare": "error",
      // see: https://www.npmjs.com/package/eslint-plugin-unused-imports
      "no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "unicorn/no-empty-file": "off",

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
      "eslint-js/no-restricted-syntax": [
        "error",
        {
          selector: "Literal[raw=/^0x/i]",
          message: "Use StyledColors instead",
        },
      ],
    },
  });
}
