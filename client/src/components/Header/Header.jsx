import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Icon, Menu } from 'semantic-ui-react';

import Paths from '../../constants/Paths';
import NotificationsPopup from './NotificationsPopup';
import UserPopup from '../UserPopup';

import styles from './Header.module.scss';

const Header = React.memo(
  ({
    project,
    user,
    notifications,
    canEditProject,
    canEditUsers,
    onProjectSettingsClick,
    onUsersClick,
    onNotificationDelete,
    onUserSettingsClick,
    onLogout,
  }) => {
    const handleProjectSettingsClick = useCallback(() => {
      if (canEditProject) {
        onProjectSettingsClick();
      }
    }, [canEditProject, onProjectSettingsClick]);

    return (
      <div className={styles.wrapper}>
        {!project && (
          <Link to={Paths.ROOT} className={classNames(styles.logo, styles.title)}>
            Planka
          </Link>
        )}
        <Menu inverted size="large" className={styles.menu}>
          {project && (
            <Menu.Menu position="left">
              <Menu.Item
                as={Link}
                to={Paths.ROOT}
                className={classNames(styles.item, styles.itemHoverable)}
              >
                <Icon fitted name="arrow left" />
              </Menu.Item>
              <Menu.Item
                className={classNames(
                  styles.item,
                  canEditProject && styles.itemHoverable,
                  styles.title,
                )}
                onClick={handleProjectSettingsClick}
              >
                {project.name}
              </Menu.Item>
            </Menu.Menu>
          )}
          <Menu.Menu position="right">
            {canEditUsers && (
              <Menu.Item
                className={classNames(styles.item, styles.itemHoverable)}
                onClick={onUsersClick}
              >
                <Icon fitted name="users" />
              </Menu.Item>
            )}
            <NotificationsPopup items={notifications} onDelete={onNotificationDelete}>
              <Menu.Item className={classNames(styles.item, styles.itemHoverable)}>
                <Icon fitted name="bell" />
                {notifications.length > 0 && (
                  <span className={styles.notification}>{notifications.length}</span>
                )}
              </Menu.Item>
            </NotificationsPopup>
            <UserPopup onSettingsClick={onUserSettingsClick} onLogout={onLogout}>
              <Menu.Item className={classNames(styles.item, styles.itemHoverable)}>
                {user.name}
              </Menu.Item>
            </UserPopup>
          </Menu.Menu>
        </Menu>
      </div>
    );
  },
);

Header.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  project: PropTypes.object,
  user: PropTypes.object.isRequired,
  notifications: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  canEditProject: PropTypes.bool.isRequired,
  canEditUsers: PropTypes.bool.isRequired,
  onProjectSettingsClick: PropTypes.func.isRequired,
  onUsersClick: PropTypes.func.isRequired,
  onNotificationDelete: PropTypes.func.isRequired,
  onUserSettingsClick: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

Header.defaultProps = {
  project: undefined,
};

export default Header;
