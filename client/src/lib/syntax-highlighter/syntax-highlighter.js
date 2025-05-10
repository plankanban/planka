/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import hljs from 'highlight.js';

import { detectLanguagesByFilename, languageLoaders } from './languages';

const loadLanguages = async (languages) => {
  for (let i = 0; i < languages.length; i += 1) {
    const language = languages[i];

    if (!hljs.getLanguage(language) && languageLoaders[language]) {
      // eslint-disable-next-line no-await-in-loop
      await languageLoaders[language](hljs.registerLanguage);
    }
  }
};

const highlight = (content, languages) =>
  languages.length === 1
    ? hljs.highlight(content, { language: languages[0] })
    : hljs.highlightAuto(content, languages.length === 0 ? undefined : languages);

export default {
  detectLanguagesByFilename,
  loadLanguages,
  highlight,
};
