/*
 * Copyright (c) 2026 Abyssal Fragments
 * SPDX-License-Identifier: MIT
 */

import type { ESLint } from "eslint";

type RuleDefinition = NonNullable<ESLint.Plugin["rules"]>[string];

const noLambdaIRule: RuleDefinition = {
  create(context) {
    return {
      ArrowFunctionExpression(node) {
        if (node.params.some((param: { name: string }) => param.name === "i")) {
          context.report({ message: "No naming lambda variables 'i'", node });
        }
      },
    };
  },
};

export default {
  meta: {
    name: "lillith",
  },
  rules: {
    "no-lambda-i": noLambdaIRule,
  } as Record<string, RuleDefinition>,
} satisfies ESLint.Plugin;
