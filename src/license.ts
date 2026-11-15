/*
 * Copyright (c) 2026 Abyssal Fragments
 * SPDX-License-Identifier: MIT
 */

export enum SharedLicense {
  PRIVATE = "private",
  PRIVATE_MEDIA = "private-media",
  MIT = "mit",
}

export const Licenses: Record<SharedLicense, string> = {
  [SharedLicense.PRIVATE]: [
    "Copyright (c) 2026 Abyssal Fragments",
    "Unauthorized copying or distribution is strictly prohibited.",
  ].join("\n\n"),
  [SharedLicense.PRIVATE_MEDIA]: [
    "Copyright (c) 2026 Abyssal Fragments",
    "All code and software assets are the exclusive property of Abyssal Fragments. Unauthorized copying, modification, or distribution of these assets is strictly prohibited.",
    "All images and visual content are the property of their respective owners and are used with permission or under applicable rights.",
  ].join("\n\n"),
  [SharedLicense.MIT]: [
    "Copyright (c) 2026 Abyssal Fragments",
    "SPDX-License-Identifier: MIT",
  ].join("\n"),
};
