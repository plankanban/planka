import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './Background.module.scss';
import globalStyles from '../../styles.module.scss';

const Background = ({ type, name, imageUrl }) => (
  <div
    className={classNames(
      styles.wrapper,
      type === 'gradient' && globalStyles[`background${upperFirst(camelCase(name))}`],
    )}
    style={{
      background: type === 'image' && `url("${imageUrl}") center / cover`,
    }}
  />
);

Background.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string,
  imageUrl: PropTypes.string,
};

Background.defaultProps = {
  name: undefined,
  imageUrl: undefined,
};

export default Background;
