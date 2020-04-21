import initials from 'initials';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './User.module.css';

const SIZES = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  MASSIVE: 'massive',
};

// TODO: move to styles
const STYLES = {
  tiny: {
    fontSize: '10px',
    fontWeight: '400',
    height: '20px',
    padding: '5.5px 0px 4.5px',
    width: '20px',
  },
  small: {
    fontSize: '12px',
    fontWeight: '400',
    height: '24px',
    lineHeight: '20px',
    padding: '2px 0px',
    width: '24px',
  },
  medium: {
    fontSize: '14px',
    fontWeight: '500',
    height: '32px',
    padding: '10px 0',
    width: '32px',
  },
  large: {
    fontSize: '14px',
    fontWeight: '500',
    height: '36px',
    padding: '12px 0 10px',
    width: '36px',
  },
  massive: {
    fontSize: '36px',
    fontWeight: '500',
    height: '100px',
    padding: '32px 0 10px',
    width: '100px',
  },
};

const COLORS = [
  '#2ecc71', // Emerald
  '#3498db', // Peter river
  '#8e44ad', // Wisteria
  '#e67e22', // Carrot
  '#e74c3c', // Alizarin
  '#1abc9c', // Turquoise
  '#2c3e50', // Midnight blue
];

const getColor = (name) => {
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) {
    sum += name.charCodeAt(i);
  }

  return COLORS[sum % COLORS.length];
};

const User = React.memo(({ name, avatarUrl, size, isDisabled, onClick }) => {
  const style = {
    ...STYLES[size],
    background: avatarUrl ? `url("${avatarUrl}")` : getColor(name),
  };

  const contentNode = (
    <span
      title={name}
      className={classNames(styles.wrapper, onClick && styles.hoverable)}
      style={style}
    >
      {!avatarUrl && <span className={styles.initials}>{initials(name)}</span>}
    </span>
  );

  return onClick ? (
    <button type="button" disabled={isDisabled} className={styles.button} onClick={onClick}>
      {contentNode}
    </button>
  ) : (
    contentNode
  );
});

User.propTypes = {
  name: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  size: PropTypes.oneOf(Object.values(SIZES)),
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
};

User.defaultProps = {
  avatarUrl: undefined,
  size: SIZES.MEDIUM,
  isDisabled: false,
  onClick: undefined,
};

export default User;
