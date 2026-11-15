/*
 * Copyright (c) 2026 Abyssal Fragments
 * SPDX-License-Identifier: MIT
 */

import { oxlint, SharedLicense } from "@abyssalfragments/linter-config";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [
    oxlint({
      license: {
        shared: SharedLicense.MIT,
      },
      extraIgnores: ["src/plugins/header.ts"],
    }),
  ],
});
