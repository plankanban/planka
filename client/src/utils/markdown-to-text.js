/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import transform from '@diplodoc/transform';

import plugins from '../configs/markdown-plugins';

export default (markdown) => {
  const tokens = transform(markdown, {
    plugins,
    tokens: true,
  });

  return tokens
    .flatMap((token) => {
      if (!token.children) {
        return [];
      }

      return token.children
        .flatMap((childrenToken) => (childrenToken.type === 'text' ? childrenToken.content : []))
        .join('');
    })
    .join('\n');
};
