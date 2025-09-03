/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './PdfViewer.module.scss';

const PdfViewer = React.memo(({ src, className }) => (
  // eslint-disable-next-line jsx-a11y/iframe-has-title
  <iframe src={src} type="application/pdf" className={classNames(styles.wrapper, className)} />
));

PdfViewer.propTypes = {
  src: PropTypes.string.isRequired,
  className: PropTypes.string,
};

PdfViewer.defaultProps = {
  className: undefined,
};

export default PdfViewer;
