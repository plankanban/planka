/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import history from '../../../history';
import selectors from '../../../selectors';
import matchPaths from '../../../utils/match-paths';
import Paths from '../../../constants/Paths';

const Linkify = React.memo(({ href, content, stopPropagation, ...props }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const url = useMemo(() => {
    try {
      return new URL(href, window.location);
    } catch {
      return null;
    }
  }, [href]);

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

  const handleClick = useCallback(
    (event) => {
      if (stopPropagation) {
        event.stopPropagation();
      }

      if (isSameSite) {
        event.preventDefault();
        history.push(event.target.href);
      }
    },
    [stopPropagation, isSameSite],
  );

  return (
    <a
      {...props} // eslint-disable-line react/jsx-props-no-spreading
      href={href}
      target={isSameSite ? undefined : '_blank'}
      rel={isSameSite ? undefined : 'noreferrer'}
      onClick={handleClick}
    >
      {card ? card.name : content}
    </a>
  );
});

Linkify.propTypes = {
  href: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  stopPropagation: PropTypes.bool,
};

Linkify.defaultProps = {
  stopPropagation: false,
};

export default Linkify;
