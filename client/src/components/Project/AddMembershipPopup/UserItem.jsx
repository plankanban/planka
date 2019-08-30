import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import User from '../../User';

import styles from './UserItem.module.css';

const UserItem = React.memo(({
  name, avatar, isActive, onSelect,
}) => (
  <button
    type="button"
    disabled={isActive}
    className={classNames(styles.menuItem, isActive && styles.menuItemActive)}
    onClick={onSelect}
  >
    <span className={styles.user}>
      <User name={name} avatar={avatar} />
    </span>
    <div className={classNames(styles.menuItemText, isActive && styles.menuItemTextActive)}>
      {name}
    </div>
  </button>
));

UserItem.propTypes = {
  name: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  isActive: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

UserItem.defaultProps = {
  avatar: undefined,
};

export default UserItem;
