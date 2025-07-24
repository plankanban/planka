/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import history from '../../history';

const SAME_SITE_CLASS = 'same-site';

document.addEventListener('click', (event) => {
  const element = event.target.closest(`a.${SAME_SITE_CLASS}`);

  if (element) {
    event.preventDefault();
    history.push(element.href);
  }
});

function process(token, nextToken) {
  const href = token.attrGet('href');

  if (!href) {
    return;
  }

  let url;
  try {
    url = new URL(href, window.location);
  } catch {
    return;
  }

  const isSameSite = url.origin === window.location.origin;
  const trimOrigin = isSameSite && nextToken.type === 'text' && nextToken.content === href;

  if (isSameSite) {
    token.attrSet('class', SAME_SITE_CLASS);
  } else {
    token.attrSet('target', '_blank');
    token.attrSet('rel', 'noreferrer');
  }

  if (trimOrigin) {
    nextToken.content = url.pathname; // eslint-disable-line no-param-reassign
  }
}

export default (md) => {
  const plugin = ({ tokens }) => {
    tokens.forEach((token) => {
      if (!token.children) {
        return;
      }

      token.children.forEach((currentToken, index) => {
        if (currentToken.type === 'link_open') {
          process(currentToken, token.children[index + 1]);
        }
      });
    });
  };

  try {
    md.core.ruler.before('includes', 'link', plugin);
  } catch (error) {
    md.core.ruler.push('link', plugin);
  }
};
