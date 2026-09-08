/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Compares every locale against the reference one and reports translation keys that are
 * missing. Run it before cutting a release: an incomplete locale falls back to English at
 * runtime, so a gap never breaks anything and nobody notices it on their own.
 *
 *   npm run locales:check --prefix client
 *
 * `login.js` and `core.js` are compared separately and never merged. `login.js` is the
 * embedded bundle and is all that exists until a session is established, so a key present
 * only in `core.js` is still missing from every screen shown before login — the two-factor
 * challenge among them.
 *
 * Keys are compared on their base name, with the CLDR plural category stripped. How many
 * categories a language needs is a property of that language: English has two, Japanese has
 * one, Arabic has six. Comparing the suffixed names would demand an English `_one` from
 * Japanese, where i18next would never read it. Contexts such as `_title` are NOT stripped —
 * those must match across every language. Each plural key is then checked against the
 * categories the language itself declares, through the same Intl.PluralRules that i18next
 * resolves with: a missing category silently falls back to `_other`, which reads wrong
 * wherever the forms differ, and Russian `few` and `many` are reachable with real counts.
 *
 * Exits non-zero when a locale is incomplete. It is deliberately not part of `lint`: a pull
 * request that adds a string is expected to leave the other locales behind for a while.
 */

import { mkdtempSync, readdirSync, rmSync } from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'vite';

const REFERENCE_LANGUAGE = 'en-US';
const BUNDLES = ['login.js', 'core.js'];
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

const localesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/locales');

// Only `translation` holds our own strings. The sibling exports (`format`, `dateFns`,
// `timeAgo`, `markdownEditor`) are per-locale data that is meant to differ.
function flatten(value, prefix = '') {
  return Object.entries(value).flatMap(([key, nested]) =>
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? flatten(nested, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

function keysOf(locale) {
  return new Set(
    Object.entries(locale.translation ?? {}).flatMap(([namespace, strings]) =>
      flatten(strings, `${namespace}.`),
    ),
  );
}

function baseKey(key) {
  return key.replace(PLURAL_SUFFIX, '');
}

// The categories i18next will actually ask for, straight from the language's own rules.
function pluralCategories(language) {
  try {
    return new Intl.PluralRules(language).resolvedOptions().pluralCategories;
  } catch {
    return ['other'];
  }
}

// The check only needs module resolution, so it skips the app's Vite config and its plugin
// chain, and keeps its cache in a throwaway directory rather than invalidating the app's.
const cacheDir = mkdtempSync(path.join(os.tmpdir(), 'planka-locales-'));

const server = await createServer({
  root: path.dirname(localesDir),
  configFile: false,
  cacheDir,
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null },
  appType: 'custom',
  logLevel: 'error',
});

const languages = readdirSync(localesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

async function inspect(bundle) {
  const loaded = await Promise.all(
    // Loaded through Vite so each locale's own imports resolve exactly as in the app.
    languages.map(async (language) => {
      const module = await server.ssrLoadModule(path.join(localesDir, language, bundle));
      return [language, keysOf(module.default)];
    }),
  );

  const keysByLanguage = Object.fromEntries(loaded);
  const reference = keysByLanguage[REFERENCE_LANGUAGE];

  if (!reference) {
    throw new Error(`Reference locale ${REFERENCE_LANGUAGE} not found in ${localesDir}`);
  }

  const referenceBase = [...new Set([...reference].map(baseKey))];
  const plurals = referenceBase.filter((key) => reference.has(`${key}_other`));

  const behind = languages
    .filter((language) => language !== REFERENCE_LANGUAGE)
    .map((language) => {
      const own = keysByLanguage[language];
      const present = new Set([...own].map(baseKey));

      const missingKeys = referenceBase.filter((key) => !present.has(key));

      const missingForms = plurals
        .filter((key) => present.has(key))
        .flatMap((key) =>
          pluralCategories(language)
            .filter((category) => !own.has(`${key}_${category}`))
            .map((category) => `${key}_${category}`),
        );

      return { language, bundle, missing: [...missingKeys, ...missingForms].sort() };
    })
    .filter(({ missing }) => missing.length > 0)
    .sort((a, b) => a.missing.length - b.missing.length || a.language.localeCompare(b.language));

  return { bundle, total: referenceBase.length, behind };
}

let report;

try {
  report = await Promise.all(BUNDLES.map(inspect));
} finally {
  await server.close();
  rmSync(cacheDir, { recursive: true, force: true });
}

// Each key is listed once per bundle, with how many locales still need it.
const summarise = ({ bundle, total, behind }) => {
  const heading = `${bundle} — reference ${REFERENCE_LANGUAGE}: ${total} keys`;

  if (behind.length === 0) {
    return `${heading}\n  all locales complete\n`;
  }

  const pending = behind.reduce(
    (counts, { missing }) =>
      missing.reduce((acc, key) => acc.set(key, (acc.get(key) ?? 0) + 1), counts),
    new Map(),
  );

  const lines = [...pending.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => `    ${String(count).padStart(3)}x  ${key}`);

  return [
    heading,
    `  ${behind.length} locales incomplete, ${pending.size} keys pending:`,
    ...lines,
    '',
  ].join('\n');
};

process.stdout.write(`${report.map(summarise).join('\n')}\n`);

const incomplete = new Set(report.flatMap(({ behind }) => behind.map(({ language }) => language)));

if (incomplete.size > 0) {
  process.stdout.write(`${incomplete.size} locale(s) incomplete.\n`);
  process.exit(1);
}

process.stdout.write('All locales complete.\n');
