/*
 * Copyright (c) 2026 Abyssal Fragments
 * SPDX-License-Identifier: MIT
 */

import { defineConfig } from "oxfmt";
import { sharedIgnores, type SharedConfig } from "./shared";

export type OxfmtConfig = SharedConfig & {
  /** Uses tabs over spaces */
  rumiMode?: boolean;
};

const defaultConfig: OxfmtConfig = Object.freeze({});
export default function oxfmt(config: OxfmtConfig = defaultConfig) {
  return defineConfig({
    ignorePatterns: [
      ...(config.extraIgnores ? config.extraIgnores : []),
      ...sharedIgnores.map((i) => `${i}/**/*`),
    ],
    tabWidth: config.rumiMode ? 4 : 2,
    useTabs: config.rumiMode,
    astro: true,
    svelte: true,
  });
}
