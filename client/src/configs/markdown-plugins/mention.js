/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { MENTION_REGEX } from '../../utils/mentions';

export default (md) => {
  md.core.ruler.push('mention', ({ tokens }) => {
    tokens.forEach((token) => {
      if (token.type === 'inline' && token.content) {
        const matches = [...token.content.matchAll(MENTION_REGEX)];

        if (matches.length > 0) {
          const newChildren = [];
          let lastIndex = 0;

          matches.forEach((match) => {
            // Add text before the mention
            if (match.index > lastIndex) {
              newChildren.push({
                type: 'text',
                content: token.content.slice(lastIndex, match.index),
                level: token.level,
              });
            }

            // Add mention token
            newChildren.push({
              type: 'mention',
              meta: {
                display: match[1],
                userId: match[2],
              },
              level: token.level,
            });

            lastIndex = match.index + match[0].length;
          });

          // Add remaining text after last mention
          if (lastIndex < token.content.length) {
            newChildren.push({
              type: 'text',
              content: token.content.slice(lastIndex),
              level: token.level,
            });
          }

          token.children = newChildren; // eslint-disable-line no-param-reassign
        }
      }
    });
  });

  // eslint-disable-next-line no-param-reassign
  md.renderer.rules.mention = (tokens, index) => {
    const { display, userId } = tokens[index].meta;
    return `<span class="mention" data-user-id="${userId}">@${display}</span>`;
  };
};
