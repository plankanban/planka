/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import languagesMap from './languages-map.json';

const LANGUAGES_BY_FILENAME = {};
const LANGUAGES_BY_EXTENSION = {};

Object.entries(languagesMap).forEach(([language, { f: filenames, e: extensions }]) => {
  if (filenames) {
    filenames.forEach((filename) => {
      if (!LANGUAGES_BY_FILENAME[filename]) {
        LANGUAGES_BY_FILENAME[filename] = [];
      }

      LANGUAGES_BY_FILENAME[filename].push(language);
    });
  }

  if (extensions) {
    extensions.forEach((extension) => {
      if (!LANGUAGES_BY_EXTENSION[extension]) {
        LANGUAGES_BY_EXTENSION[extension] = [];
      }

      LANGUAGES_BY_EXTENSION[extension].push(language);
    });
  }
});

export { LANGUAGES_BY_FILENAME, LANGUAGES_BY_EXTENSION };

export const detectLanguagesByFilename = (filename) => {
  let languages = LANGUAGES_BY_FILENAME[filename];

  if (languages) {
    return languages;
  }

  const extensions = filename.substring(1).split('.');

  if (extensions.length === 1) {
    return [];
  }

  if (extensions.length > 2) {
    const extension = extensions.slice(-2).join('.');
    languages = LANGUAGES_BY_EXTENSION[extension];

    if (languages) {
      return languages;
    }
  }

  return LANGUAGES_BY_EXTENSION[extensions[extensions.length - 1]] || [];
};

const createLanguageLoader = (language, loader) => async (registerLanguage) => {
  const { default: definition } = await loader();
  registerLanguage(language, definition);
};

export const languageLoaders = {
  '4d': createLanguageLoader('4d', () => import('highlightjs-4d')),
  'sap-abap': createLanguageLoader('sap-abap', () => import('highlightjs-sap-abap')),
  apex: createLanguageLoader('apex', () => import('highlightjs-apex')),
  alan: createLanguageLoader('alan', () => import('highlightjs-alan')),
  ballerina: createLanguageLoader('ballerina', () => import('@ballerina/highlightjs-ballerina')),
  blade: createLanguageLoader('blade', () => import('highlightjs-blade')),
  cobol: createLanguageLoader('cobol', () => import('highlightjs-cobol')),
  chapel: createLanguageLoader('chapel', () => import('./language-definitions/chapel')),
  dafny: createLanguageLoader('dafny', () => import('./language-definitions/dafny')),
  godot: createLanguageLoader('godot', () => import('./language-definitions/godot')),
  gn: createLanguageLoader('gn', () => import('./language-definitions/gn')),
  gf: createLanguageLoader('gf', () => import('highlightjs-gf')),
  hlsl: createLanguageLoader('hlsl', () => import('./language-definitions/hlsl')),
  jolie: createLanguageLoader('jolie', () => import('highlightjs-jolie')),
  lean: createLanguageLoader('lean', () => import('highlightjs-lean')),
  lookml: createLanguageLoader('lookml', () => import('highlightjs-lookml')),
  macaulay2: createLanguageLoader('macaulay2', () => import('highlightjs-macaulay2')),
  mlir: createLanguageLoader('mlir', () => import('highlightjs-mlir')),
  papyrus: createLanguageLoader('papyrus', () => import('hightlightjs-papyrus')),
  qsharp: createLanguageLoader('qsharp', () => import('highlightjs-qsharp')),
  cshtml: createLanguageLoader('cshtml', () => import('highlightjs-cshtml-razor')),
  redbol: createLanguageLoader('redbol', () => import('highlightjs-redbol')),
  'rpm-specfile': createLanguageLoader('rpm-specfile', () => import('highlightjs-rpm-specfile')),
  solidity: createLanguageLoader('solidity', () => import('highlightjs-solidity')),
  supercollider: createLanguageLoader('supercollider', () => import('highlightjs-supercollider')),
  svelte: createLanguageLoader('svelte', () => import('highlightjs-svelte')),
  terraform: createLanguageLoader('terraform', () => import('./language-definitions/terraform')),
  xsharp: createLanguageLoader('xsharp', () => import('highlightjs-xsharp')),
  zenscript: createLanguageLoader('zenscript', () => import('highlightjs-zenscript')),
};
