/*
 * Copyright (c) 2026 Abyssal Fragments
 * SPDX-License-Identifier: MIT
 */

import { defineConfig } from "oxfmt";

export type OxfmtConfig = {
  /** Uses tabs over spaces */
  rumiMode?: boolean;
};

const defaultConfig: OxfmtConfig = Object.freeze({});
export default function oxfmt(config: OxfmtConfig = defaultConfig) {
  return defineConfig({
    ignorePatterns: ["dist/**/*"],
    tabWidth: config.rumiMode ? 4 : 2,
    useTabs: config.rumiMode,
  });
}
