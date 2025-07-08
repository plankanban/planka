/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import LinkifyReact from 'linkify-react';

import history from '../../history';
import selectors from '../../selectors';
import matchPaths from '../../utils/match-paths';
import Paths from '../../constants/Paths';

const Linkify = React.memo(({ children, linkStopPropagation, ...props }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const url = useMemo(() => {
    try {
      return new URL(children, window.location);
    } catch {
      return null;
    }
  }, [children]);

  const isSameSite = !!url && url.origin === window.location.origin;

  const cardsPathMatch = useMemo(() => {
    if (!isSameSite) {
      return null;
    }

    return matchPaths(url.pathname, [Paths.CARDS]);
  }, [url.pathname, isSameSite]);

  const card = useSelector((state) => {
    if (!cardsPathMatch) {
      return null;
    }

    return selectCardById(state, cardsPathMatch.params.id);
  });

  const handleLinkClick = useCallback(
    (event) => {
      if (linkStopPropagation) {
        event.stopPropagation();
      }

      if (isSameSite) {
        event.preventDefault();
        history.push(event.target.href);
      }
    },
    [linkStopPropagation, isSameSite],
  );

  const linkRenderer = useCallback(
    ({ attributes: { href, ...linkProps }, content }) => (
      <a
        {...linkProps} // eslint-disable-line react/jsx-props-no-spreading
        href={href}
        target={isSameSite ? undefined : '_blank'}
        rel={isSameSite ? undefined : 'noreferrer'}
        onClick={handleLinkClick}
      >
        {card ? card.name : content}
      </a>
    ),
    [isSameSite, card, handleLinkClick],
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
