/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

export const MENTION_REGEX = /@\[(.*?)\]\((.*?)\)/g;
export const MENTION_NAME_REGEX = /@\[(.*?)\]\(.*?\)/g;

export const formatTextWithMentions = (text) => text.replace(MENTION_NAME_REGEX, '@$1');
