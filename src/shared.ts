/*
 * Copyright (c) 2026 Abyssal Fragments
 * SPDX-License-Identifier: MIT
 */

export const sharedIgnores = ["dist", "build", "drizzle"];

export type SharedConfig = {
  extraIgnores?: string[];
};
