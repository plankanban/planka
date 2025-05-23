/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

import styles from './Favicon.module.scss';

const Favicon = React.memo(({ url }) => {
  const [isImageError, setIsImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setIsImageError(true);
  }, []);

  return isImageError ? (
    <Icon fitted name="linkify" className={styles.fallbackIcon} />
  ) : (
    <img src={url} onError={handleImageError} /> // eslint-disable-line jsx-a11y/alt-text
  );
});

Favicon.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Favicon;
