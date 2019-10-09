import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import LabelColors from '../../constants/LabelColors';

import styles from './Label.module.css';

const SIZES = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
};

// TODO: move to styles
const STYLES = {
  tiny: {
    fontSize: '12px',
    lineHeight: '20px',
    maxWidth: '176px',
    padding: '0px 6px',
  },
  small: {
    fontSize: '12px',
    lineHeight: '20px',
    maxWidth: '176px',
    padding: '2px 8px',
  },
  medium: {
    fontSize: '14px',
    lineHeight: '32px',
    maxWidth: '230px',
    padding: '0 12px',
  },
};

const Label = React.memo(({
  name, color, size, isDisabled, onClick,
}) => {
  const style = {
    ...STYLES[size],
    background: LabelColors.MAP[color],
  };

  const contentNode = (
    <div
      title={name}
      className={classNames(styles.wrapper, onClick && styles.hoverable)}
      style={style}
    >
      {name || '\u00A0'}
    </div>
  );

  return onClick ? (
    <button type="button" disabled={isDisabled} className={styles.button} onClick={onClick}>
      {contentNode}
    </button>
  ) : (
    contentNode
  );
});

Label.propTypes = {
  name: PropTypes.string,
  color: PropTypes.oneOf(LabelColors.KEYS).isRequired,
  size: PropTypes.oneOf(Object.values(SIZES)),
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
};

Label.defaultProps = {
  name: undefined,
  size: SIZES.MEDIUM,
  isDisabled: false,
  onClick: undefined,
};

export default Label;
