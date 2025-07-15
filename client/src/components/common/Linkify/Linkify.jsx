/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import LinkifyReact from 'linkify-react';

import Link from './Link';

const Linkify = React.memo(({ children, linkStopPropagation, ...props }) => {
  const linkRenderer = useCallback(
    ({ attributes: { href, ...linkProps }, content }) => (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Link {...linkProps} href={href} content={content} stopPropagation={linkStopPropagation} />
    ),
    [linkStopPropagation],
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
  linkStopPropagation: undefined,
};

export default Linkify;
