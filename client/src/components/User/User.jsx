import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import initials from 'initials';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './User.module.scss';

const SIZES = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  MASSIVE: 'massive',
};

const COLORS = [
  'emerald',
  'peter-river',
  'wisteria',
  'carrot',
  'alizarin',
  'turquoise',
  'midnight-blue',
];

const getColor = (name) => {
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) {
    sum += name.charCodeAt(i);
  }

  return COLORS[sum % COLORS.length];
};

const User = React.memo(({ name, avatarUrl, size, isDisabled, onClick }) => {
  const contentNode = (
    <span
      title={name}
      className={classNames(
        styles.wrapper,
        styles[`wrapper${upperFirst(size)}`],
        onClick && styles.wrapperHoverable,
        !avatarUrl && styles[`background${upperFirst(camelCase(getColor(name)))}`],
      )}
      style={{
        background: avatarUrl && `url("${avatarUrl}") center / cover`,
      }}
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
