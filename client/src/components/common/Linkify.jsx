/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import LinkifyReact from 'linkify-react';

import history from '../../history';
import selectors from '../../selectors';

const Linkify = React.memo(({ children, linkStopPropagation, ...props }) => {
  const cardNamesById = useSelector(selectors.selectCardNamesById);

  const handleLinkClick = useCallback(
    (event) => {
      if (linkStopPropagation) {
        event.stopPropagation();
      }

      if (!event.target.getAttribute('target')) {
        event.preventDefault();
        history.push(event.target.href);
      }
    },
    [linkStopPropagation],
  );

  const linkRenderer = useCallback(
    ({ attributes: { href, ...linkProps }, content }) => {
      let url;
      try {
        url = new URL(href, window.location);
      } catch {
        /* empty */
      }

      const isSameSite = !!url && url.origin === window.location.origin;
      let linkContent = content;
      if (isSameSite) {
        const { pathname } = url;
        const match = pathname.match(/^\/cards\/([^/]+)$/);
        linkContent = cardNamesById[match?.[1]] || pathname;
      }

      return (
        <a
          {...linkProps} // eslint-disable-line react/jsx-props-no-spreading
          href={href}
          target={isSameSite ? undefined : '_blank'}
          rel={isSameSite ? undefined : 'noreferrer'}
          onClick={handleLinkClick}
        >
          {isSameSite ? linkContent : content}
        </a>
      );
    },
    [handleLinkClick, cardNamesById],
  );

  return (
    <LinkifyReact
      {...props} // eslint-disable-line react/jsx-props-no-spreading
      options={{
        defaultProtocol: 'https',
        render: linkRenderer,
      }}
    >
      {children}
    </LinkifyReact>
  );
});

Linkify.propTypes = {
  children: PropTypes.string.isRequired,
  linkStopPropagation: PropTypes.bool,
};

Linkify.defaultProps = {
  linkStopPropagation: false,
};

export default Linkify;
