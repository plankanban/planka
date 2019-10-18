import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Icon, Menu } from 'semantic-ui-react';

import Paths from '../../constants/Paths';
import NotificationsPopup from './NotificationsPopup';
import UserPopup from '../UserPopup';

import styles from './Header.module.css';

const Header = React.memo(
  ({
    user,
    notifications,
    isEditable,
    onUsers,
    onNotificationDelete,
    onUserUpdate,
    onUserAvatarUpload,
    onUserEmailUpdate,
    onUserEmailUpdateMessageDismiss,
    onUserPasswordUpdate,
    onUserPasswordUpdateMessageDismiss,
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
            email={user.email}
            name={user.name}
            avatar={user.avatar}
            isAvatarUploading={user.isAvatarUploading}
            emailUpdateForm={user.emailUpdateForm}
            passwordUpdateForm={user.passwordUpdateForm}
            onUpdate={onUserUpdate}
            onAvatarUpload={onUserAvatarUpload}
            onEmailUpdate={onUserEmailUpdate}
            onEmailUpdateMessageDismiss={onUserEmailUpdateMessageDismiss}
            onPasswordUpdate={onUserPasswordUpdate}
            onPasswordUpdateMessageDismiss={onUserPasswordUpdateMessageDismiss}
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
  onUsers: PropTypes.func.isRequired,
  onNotificationDelete: PropTypes.func.isRequired,
  onUserUpdate: PropTypes.func.isRequired,
  onUserAvatarUpload: PropTypes.func.isRequired,
  onUserEmailUpdate: PropTypes.func.isRequired,
  onUserEmailUpdateMessageDismiss: PropTypes.func.isRequired,
  onUserPasswordUpdate: PropTypes.func.isRequired,
  onUserPasswordUpdateMessageDismiss: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default Header;
