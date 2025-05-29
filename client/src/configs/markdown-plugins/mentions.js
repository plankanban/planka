/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const mentionsPlugin = (md) => {
  const mentionRegex = /@\[(.*?)\]\((.*?)\)/g;

  const renderMention = (tokens, idx) => {
    const token = tokens[idx];
    const { display, userId } = token.meta;

    return `<span class="mention" data-user-id="${userId}" style="color: #0366d6; background-color: #f1f8ff; border-radius: 3px; padding: 0 2px;">@${display}</span>`;
  };

  md.core.ruler.push('mentions', (state) => {
    const { tokens } = state;

    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      if (token.type === 'inline' && token.content) {
        const matches = [...token.content.matchAll(mentionRegex)];
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

          token.children = newChildren;
        }
      }
    }
  });

  // eslint-disable-next-line no-param-reassign
  md.renderer.rules.mention = renderMention;
};

export default mentionsPlugin;
