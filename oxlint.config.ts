/*
 * Copyright (c) 2026 Abyssal Fragments
 * SPDX-License-Identifier: MIT
 */

import { defineConfig } from "oxlint";
import { oxlint, SharedLicense } from "@abyssalfragments/linter-config";

export default defineConfig({
  extends: [
    oxlint({
      license: {
        shared: SharedLicense.MIT,
      },
    }),
  ],
});
