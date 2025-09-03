/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const MENTION_ID_REGEX = /@\[.*?\]\((.*?)\)/g;
const MENTION_USERNAME_REGEX = /@\[(.*?)\]\(.*?\)/g;

const extractMentionIds = (text) => {
  const matches = [...text.matchAll(MENTION_ID_REGEX)];
  return matches.map((match) => match[1]);
};

const mentionMarkupToText = (markup) =>
  markup.replace(MENTION_USERNAME_REGEX, (_, username) => `@${username}`);

module.exports = {
  extractMentionIds,
  mentionMarkupToText,
};
