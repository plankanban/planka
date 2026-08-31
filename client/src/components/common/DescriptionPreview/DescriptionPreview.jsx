/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import normalizeDescriptionPreviewText from '../../../utils/description-preview';

import styles from './DescriptionPreview.module.scss';

const DescriptionPreview = React.memo(({ children, maxLines, className }) => {
  const text = useMemo(() => normalizeDescriptionPreviewText(children), [children]);

  if (!text) {
    return null;
  }

  return (
    <div
      title={text}
      className={classNames(styles.wrapper, className)}
      style={{ '--description-preview-lines': maxLines }}
    >
      {text}
    </div>
  );
});

DescriptionPreview.propTypes = {
  children: PropTypes.string.isRequired,
  maxLines: PropTypes.number,
  className: PropTypes.string,
};

DescriptionPreview.defaultProps = {
  maxLines: 2,
  className: undefined,
};

export default DescriptionPreview;
