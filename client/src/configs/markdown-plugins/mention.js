/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

export default (md) => {
  md.core.ruler.push('mention', ({ tokens }) => {
    tokens.forEach((token) => {
      if (!token.children) {
        return;
      }

      for (let i = 0; i < token.children.length - 3; i += 1) {
        const currentToken = token.children[i];
        const linkOpenToken = token.children[i + 1];
        const textToken = token.children[i + 2];
        const linkCloseToken = token.children[i + 3];

        if (
          currentToken.type === 'text' &&
          currentToken.content.endsWith('@') &&
          linkOpenToken.type === 'link_open' &&
          textToken.type === 'text' &&
          linkCloseToken.type === 'link_close'
        ) {
          const userId = linkOpenToken.attrGet('href');
          const { content: name } = textToken;

          if (currentToken.content.length === 1) {
            token.children.splice(i, 1);
            i -= 1;
          } else {
            currentToken.content = currentToken.content.slice(0, -1);
          }

          const mentionToken = {
            ...currentToken,
            type: 'mention',
            meta: {
              userId,
              name,
            },
          };

          token.children.splice(i + 1, 3, mentionToken);
          i += 1;
        }
      }
    });
  });

  // eslint-disable-next-line no-param-reassign
  md.renderer.rules.mention = (tokens, index) => {
    const { userId, name } = tokens[index].meta;
    return `<span class="mention" data-user-id="${userId}">@${name}</span>`;
  };
};
