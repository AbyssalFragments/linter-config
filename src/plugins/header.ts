// header-disable
/*
 * eslint-plugin-simple-header, a license header plugin for ESLint
 * Written in 2023 by rini <rini@rinici.de>
 * Adapted in 2026 by Lillith Rose <lillithrose@abyssalfragments.org>
 *
 * To the extend possible by law, the author has dedicated all copyright
 * and related rights to this software to the public domain worldwide.
 * This software is distributed without any warranty. You should have
 * received a copy of the CC0 Public Domain Dedication along with this
 * software. If not, see <https://creativecommons.org/publicdomain/zero/1.0/>
 *
 * SPDX-License-Identifier: CC0-1.0
 */
/*
 * Edited version of rini's eslint-plugin-simple-header
 * github.com/rniii/eslint-plugin-simple-header
 * Adapted to support different levels of indentation in markup files
 * for when the linter and formatter disagree on indent level
 * Additionally, adds a // header-disable comment
 * for adapting files under compatable licenses (like this one)
 */

import { readFileSync } from "node:fs";

import type { ESLint } from "eslint";
import type { JSONSchema4 } from "json-schema";

type Syntax = string | [string, string];
type Decor = string | [string, string, string];
type Templates = Record<string, [string, string]>;

type HeaderOptions = {
  syntax?: Syntax;
  decor?: Decor;
  templates?: Templates;
  newlines?: number;
  linebreak?: "unix" | "windows";
  allowIndent?: boolean;
} & ({ files: string[]; text?: never } | { files?: never; text: string | string[] });
const mapLines = (text: string, f: (line: string) => string): string =>
  text.split("\n").map(f).join("\n");

const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function isComment(text: string, syntax: Syntax): boolean {
  if (Array.isArray(syntax)) return text.startsWith(syntax[0]) && text.endsWith(syntax[1]);

  return text.split("\n").every((x) => x.startsWith(syntax));
}

function makeComment(text: string, syntax: Syntax, decor: Decor): string {
  if (isComment(text, syntax)) return text;

  if (Array.isArray(syntax))
    return (
      syntax[0] + decor[0] + mapLines(text, (x) => (decor[1] + x).trimEnd()) + decor[2] + syntax[1]
    );

  return mapLines(text, (x) => (syntax + decor + x).trimEnd());
}

function matchHeader(srcHeader: string, headers: string[], templates: Templates): boolean {
  for (const header of headers) {
    const body = escapeRegex(header).replace(
      /\\\{(\w+)\\\}/g,
      (m, key) => templates[key]?.[0] ?? m,
    );

    if (new RegExp(`^${body}$`).test(srcHeader)) return true;
  }

  return false;
}

function makeHeader(headers: string[], templates: Templates): string {
  return headers[0].replace(/\{(\w+)\}/g, (m, key) => templates[key]?.[1] ?? m);
}

function stripExclamations(header: string, syntax: Syntax): string {
  if (Array.isArray(syntax)) {
    if (header.startsWith(syntax[0] + "!")) return syntax[0] + header.slice(syntax[0].length + 1);

    return header;
  }

  return mapLines(header, (x) =>
    x.startsWith(syntax + "!") ? syntax + x.slice(syntax.length + 1) : x,
  );
}

function findHeader(src: string, syntax: Syntax, allowIndent: boolean): string {
  let pat;
  if (Array.isArray(syntax))
    pat = String.raw`^\s*(${escapeRegex(syntax[0])}.*?${escapeRegex(syntax[1])}(?:[ \t]*\r?\n)*)?`;
  else
    pat = String.raw`^\s*(${allowIndent ? "[ \\t]*" : ""}${escapeRegex(syntax)}[^\n]*\r?\n)*(?:[ \t]*\r?\n)*`;

  const match = new RegExp(pat, "s").exec(src)?.[0] ?? "";
  if ((allowIndent ? match.trimStart() : match).startsWith("/**")) return "";
  return match;
}

function stripIndent(header: string, allowIndent: boolean): string {
  const firstLine = header.search(/\S/);
  const indent = firstLine < 0 ? "" : (header.slice(0, firstLine).match(/[ \t]*$/)?.[0] ?? "");
  const trimmed = header.trim();
  if (!allowIndent || !indent) return trimmed;

  const lines = trimmed.split("\n");
  if (!lines.slice(1).every((line) => line.startsWith(indent))) return trimmed;
  return lines.map((line, index) => (index === 0 ? line : line.slice(indent.length))).join("\n");
}

const validSyntax: JSONSchema4[] = [
  {
    properties: {
      syntax: { type: "string" },
      decor: { type: "string" },
    },
  },
  {
    properties: {
      syntax: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 2 },
      decor: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
    },
  },
];

const validSources: JSONSchema4[] = [
  {
    required: ["files"],
    properties: { files: { type: "array", items: { type: "string" }, minItems: 1 } },
  },
  {
    required: ["text"],
    properties: {
      text: { oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] },
    },
  },
];

const schema: JSONSchema4[] = [
  {
    type: "object",
    additionalProperties: false,
    allOf: [{ anyOf: validSyntax }, { oneOf: validSources }],
    properties: {
      syntax: {},
      decor: {},
      files: {},
      text: {},
      templates: {
        type: "object",
        additionalProperties: false,
        patternProperties: {
          "^\\w+$": {
            type: "array",
            items: { type: "string" },
            minItems: 2,
            maxItems: 2,
          },
        },
      },
      newlines: { type: "number", minimum: 0 },
      allowIndent: { type: "boolean" },
      linebreak: {
        type: "string",
        pattern: "^(unix|windows)$",
      },
    },
  },
];

export default {
  meta: {
    name: "@abyssalfragments/linter-config/plugins/header",
  },
  rules: {
    header: {
      meta: { type: "layout", fixable: "code", schema },
      create(ctx) {
        const options = ctx.options[0] as unknown as HeaderOptions;
        const syntax = options.syntax ?? ["/*", "*/"];
        const decor = options.decor ?? (Array.isArray(syntax) ? ["\n", " * ", "\n "] : " ");
        const templates: Templates = {
          year: ["\\d{4}", `${new Date().getFullYear()}`],
          ...options.templates,
        };
        const newlines = options.newlines ?? 1;
        const allowIndent = options.allowIndent ?? false;
        const rawHeaders = options.files
          ? options.files.map((f) => readFileSync(f, "utf8").trim())
          : [Array.isArray(options.text) ? options.text.join("\n") : options.text];

        const src = "text" in ctx.sourceCode ? ctx.sourceCode.text : null;
        if (!src) return {};
        const endl = options.linebreak
          ? options.linebreak === "windows"
            ? "\r\n"
            : "\n"
          : src.includes("\r\n")
            ? "\r\n"
            : "\n";
        // skip over a shebang, if present
        const offset = src.match(/^#!.*?\n/)?.[0]?.length ?? 0;
        if (/^\s*\/\/ header-disable(?:\r?\n|$)/.test(src.slice(offset))) return {};

        const srcHeader = findHeader(src.slice(offset), syntax, allowIndent);
        const headers = rawHeaders.map((raw) =>
          makeComment(raw, syntax, decor).replace(/\n/g, endl),
        );
        const trailingLines = endl.repeat(src.slice(srcHeader.length).trim() ? 1 + newlines : 1);

        if (
          !matchHeader(
            stripExclamations(stripIndent(srcHeader, allowIndent), syntax),
            headers,
            templates,
          )
        ) {
          ctx.report({
            message: srcHeader.trim() ? "Invalid header" : "Missing header",
            loc: { line: 1, column: 0 },
            fix(fixer) {
              const header = makeHeader(headers, templates) + trailingLines;
              return fixer.replaceTextRange([offset, offset + srcHeader.length], header);
            },
          });
        } else if (
          !stripIndent(srcHeader, allowIndent).startsWith(syntax[0]) ||
          /(\r?\n)*$/.exec(srcHeader)?.[0] !== trailingLines
        ) {
          ctx.report({
            message: "Bad header spacing",
            loc: { line: 1, column: 0 },
            fix(fixer) {
              const indent = allowIndent ? (srcHeader.match(/^[ \t]*/)?.[0] ?? "") : "";
              const header = indent + srcHeader.trim() + trailingLines;
              return fixer.replaceTextRange([offset, offset + srcHeader.length], header);
            },
          });
        }
        return {};
      },
    },
  },
} as ESLint.Plugin;
