/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const USERNAME_CHAR_CLASS = 'a-zA-Z0-9._';
const USERNAME_CHAR_REGEX = new RegExp(`^[${USERNAME_CHAR_CLASS}]$`);

const MENTION_TEXT_REGEX = new RegExp(
  `(^|[^${USERNAME_CHAR_CLASS}])@([${USERNAME_CHAR_CLASS}]+)`,
  'gi',
);

const MENTION_MARKUP_REGEX = /@\[(.*?)\]\((.*?)\)/g;

export const mentionTextToMarkup = (text, userByUsername) =>
  text.replace(MENTION_TEXT_REGEX, (match, before, username) => {
    const user = userByUsername[username.toLowerCase()];
    return user ? `${before}@[${user.username}](${user.id})` : match;
  });

export const mentionMarkupToText = (markup) =>
  markup.replace(MENTION_MARKUP_REGEX, (_, username) => `@${username}`);

export const isUsernameChar = (char) => USERNAME_CHAR_REGEX.test(char);
