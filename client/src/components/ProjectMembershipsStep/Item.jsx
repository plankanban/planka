import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Menu } from 'semantic-ui-react';

import User from '../User';

import styles from './Item.module.scss';

const Item = React.memo(({ isPersisted, isActive, user, onUserSelect, onUserDeselect }) => {
  const handleToggleClick = useCallback(() => {
    if (isActive) {
      onUserDeselect();
    } else {
      onUserSelect();
    }
  }, [isActive, onUserSelect, onUserDeselect]);

  return (
    <Menu.Item
      active={isActive}
      disabled={!isPersisted}
      className={classNames(styles.menuItem, isActive && styles.menuItemActive)}
      onClick={handleToggleClick}
    >
      <span className={styles.user}>
        <User name={user.name} avatarUrl={user.avatarUrl} />
      </span>
      <div className={classNames(styles.menuItemText, isActive && styles.menuItemTextActive)}>
        {user.name}
      </div>
    </Menu.Item>
  );
});

Item.propTypes = {
  isPersisted: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUserSelect: PropTypes.func.isRequired,
  onUserDeselect: PropTypes.func.isRequired,
};

export default Item;
