import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Icon, Menu } from 'semantic-ui-react';

import Paths from '../../constants/Paths';
import NotificationsPopup from './NotificationsPopup';
import UserPopup from './UserPopup';

import styles from './Header.module.css';

const Header = React.memo(
  ({
    user,
    notifications,
    isEditable,
    onUserUpdate,
    onUserAvatarUpload,
    onNotificationDelete,
    onUsers,
    onLogout,
  }) => (
    <div className={styles.wrapper}>
      <Link to={Paths.ROOT} className={styles.logo}>
        Planka
      </Link>
      <Menu inverted size="large" className={styles.menu}>
        <Menu.Menu position="right">
          {isEditable && (
            <Menu.Item className={styles.item} onClick={onUsers}>
              <Icon fitted name="users" />
            </Menu.Item>
          )}
          <NotificationsPopup items={notifications} onDelete={onNotificationDelete}>
            <Menu.Item className={styles.item}>
              <Icon fitted name="bell" />
              {notifications.length > 0 && (
                <span className={styles.notification}>{notifications.length}</span>
              )}
            </Menu.Item>
          </NotificationsPopup>
          <UserPopup
            name={user.name}
            avatar={user.avatar}
            isAvatarUploading={user.isAvatarUploading}
            onUpdate={onUserUpdate}
            onAvatarUpload={onUserAvatarUpload}
            onLogout={onLogout}
          >
            <Menu.Item className={styles.item}>{user.name}</Menu.Item>
          </UserPopup>
        </Menu.Menu>
      </Menu>
    </div>
  ),
);

Header.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  user: PropTypes.object.isRequired,
  notifications: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  isEditable: PropTypes.bool.isRequired,
  onUserUpdate: PropTypes.func.isRequired,
  onUserAvatarUpload: PropTypes.func.isRequired,
  onNotificationDelete: PropTypes.func.isRequired,
  onUsers: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default Header;
