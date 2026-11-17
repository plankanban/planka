/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useContext } from 'react';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Menu } from 'semantic-ui-react';
import { Tooltip } from '../../../lib/custom-ui';
import { usePopup } from '../../../lib/popup';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import Paths from '../../../constants/Paths';
import { BoardMembershipRoles, BoardViews, UserRoles } from '../../../constants/Enums';
import { SidebarContext } from '../../../contexts';
import NotificationsStep from '../../notifications/NotificationsStep';

import styles from './Header.module.scss';

const POPUP_PROPS = {
  position: 'bottom right',
};

const Header = React.memo(() => {
  const user = useSelector(selectors.selectCurrentUser);
  const project = useSelector(selectors.selectCurrentProject);
  const board = useSelector(selectors.selectCurrentBoard);
  const notificationIds = useSelector(selectors.selectNotificationIdsForCurrentUser);
  const isEditModeEnabled = useSelector(selectors.selectIsEditModeEnabled);

  const { withEditModeToggler, canEditProject } = useSelector((state) => {
    if (!project) {
      return {
        withEditModeToggler: false,
        canEditProject: false,
      };
    }

    const isAdminInSharedProject = user.role === UserRoles.ADMIN && !project.ownerProjectManagerId;
    const isManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);

    if (isAdminInSharedProject || isManager) {
      return {
        withEditModeToggler: true,
        canEditProject: isEditModeEnabled,
      };
    }

    if (!board) {
      return {
        withEditModeToggler: false,
        canEditProject: false,
      };
    }

    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    const isEditor = !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;

    return {
      withEditModeToggler: board.view === BoardViews.KANBAN && isEditor,
      canEditProject: false,
    };
  }, shallowEqual);

  const [, setIsSidebarOpen] = useContext(SidebarContext);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleOpenSidebarClick = useCallback(() => {
    setIsSidebarOpen(true);
  }, [setIsSidebarOpen]);

  const handleToggleEditModeClick = useCallback(() => {
    dispatch(entryActions.toggleEditMode(!isEditModeEnabled));
  }, [isEditModeEnabled, dispatch]);

  const handleProjectSettingsClick = useCallback(() => {
    if (!canEditProject) {
      return;
    }

    dispatch(entryActions.openProjectSettingsModal());
  }, [canEditProject, dispatch]);

  const NotificationsPopup = usePopup(NotificationsStep, POPUP_PROPS);

  return (
    <div className={styles.wrapper}>
      <Menu size="large" className={styles.menu}>
        <Menu.Menu position="left">
          <Menu.Item
            aria-label={t('action.openMenu')}
            className={classNames(styles.item, styles.itemHoverable, styles.menuToggler)}
            onClick={handleOpenSidebarClick}
          >
            <Icon fitted name="bars" />
          </Menu.Item>
          {project ? (
            <Menu.Item className={classNames(styles.item, styles.title)}>
              <Link to={Paths.ROOT} className={styles.breadcrumb}>
                {t('common.home')}
              </Link>
              <Icon fitted name="angle right" className={styles.breadcrumbSeparator} />
              <span className={styles.titleText}>{project.name}</span>
              {canEditProject && (
                <Tooltip content={t('common.openProjectSettings')}>
                  <Button
                    aria-label={t('common.openProjectSettings')}
                    className={styles.editButton}
                    onClick={handleProjectSettingsClick}
                  >
                    <Icon fitted name="setting" />
                  </Button>
                </Tooltip>
              )}
            </Menu.Item>
          ) : (
            <Menu.Item className={classNames(styles.item, styles.title)}>
              {t('common.home')}
            </Menu.Item>
          )}
        </Menu.Menu>
        <Menu.Menu position="right">
          {withEditModeToggler && (
            <Tooltip
              content={t(isEditModeEnabled ? 'action.disableEditMode' : 'action.enableEditMode')}
            >
              <Menu.Item
                className={classNames(styles.item, styles.itemHoverable)}
                onClick={handleToggleEditModeClick}
              >
                <Icon
                  fitted
                  name={isEditModeEnabled ? 'unlock' : 'lock'}
                  className={classNames(isEditModeEnabled && styles.itemIconEnabled)}
                />
              </Menu.Item>
            </Tooltip>
          )}
          <NotificationsPopup>
            <Tooltip content={t('common.openNotifications')}>
              <Menu.Item className={classNames(styles.item, styles.itemHoverable)}>
                <Icon fitted name="bell" />
                {notificationIds.length > 0 && (
                  <span className={styles.notification}>{notificationIds.length}</span>
                )}
              </Menu.Item>
            </Tooltip>
          </NotificationsPopup>
        </Menu.Menu>
      </Menu>
    </div>
  );
});

export default Header;
