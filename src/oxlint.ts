/*
 * Copyright (c) 2026 Abyssal Fragments
 * SPDX-License-Identifier: MIT
 */

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
      ...sharedIgnores.map((ignore) => `${ignore}/*`),
    ],
    jsPlugins: [
      {
        name: "eslint-js",
        specifier: "oxlint-plugin-eslint",
      },
      {
        name: "lillith",
        specifier: "@abyssalfragments/linter-config/plugins/lillith",
      },
      config.license
        ? {
            name: "header",
            specifier: "@abyssalfragments/linter-config/plugins/header",
          }
        : null,
    ].filter((plugin) => plugin !== null),
    env: config.env ?? {
      node: true,
      es6: true,
    },
    rules: {
      ...(config.license
        ? {
            "header/header": [
              "error",
              {
                allowIndent: true,
                ...("file" in config.license
                  ? {
                      files: [config.license.file],
                    }
                  : {
                      text:
                        "shared" in config.license
                          ? Licenses[config.license.shared]
                          : config.license.text,
                    }),
              },
            ],
          }
        : {}),
      "no-undef": "off",
      "no-redeclare": "error",
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

      "lillith/no-lambda-i": "error",

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
