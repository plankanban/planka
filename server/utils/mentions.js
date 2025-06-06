/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const MENTION_ID_REGEX = /@\[.*?\]\((.*?)\)/g;
const MENTION_NAME_REGEX = /@\[(.*?)\]\(.*?\)/g;

const extractMentionIds = (text) => {
  const matches = [...text.matchAll(MENTION_ID_REGEX)];
  return matches.map((match) => match[1]);
};

const formatTextWithMentions = (text) => text.replace(MENTION_NAME_REGEX, '@$1');

module.exports = {
  MENTION_ID_REGEX,
  MENTION_NAME_REGEX,

  extractMentionIds,
  formatTextWithMentions,
};
