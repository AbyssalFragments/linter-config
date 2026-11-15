/*
 * Copyright (c) 2026 Abyssal Fragments
 * SPDX-License-Identifier: MIT
 */

import { defineConfig } from "tsdown";

export default defineConfig({
  exports: true,
  entry: {
    index: "./src/index.ts",
    "plugins/*": "./src/plugins/*.ts",
  },
});
