/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
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
import UserAvatar from '../../users/UserAvatar';
import UserActionsStep from '../../users/UserActionsStep';
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
  const isFavoritesEnabled = useSelector(selectors.selectIsFavoritesEnabled);
  const isEditModeEnabled = useSelector(selectors.selectIsEditModeEnabled);

  const withFavoritesToggler = useSelector(
    // TODO: use selector instead?
    (state) => selectors.selectFavoriteProjectIdsForCurrentUser(state).length > 0,
  );

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

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleToggleFavoritesClick = useCallback(() => {
    dispatch(entryActions.toggleFavorites(!isFavoritesEnabled));
  }, [isFavoritesEnabled, dispatch]);

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
  const UserActionsPopup = usePopup(UserActionsStep, POPUP_PROPS);

  return (
    <div className={styles.wrapper}>
      {!project && (
        <Link to={Paths.ROOT} className={classNames(styles.logo, styles.title)}>
          PLANKA
        </Link>
      )}
      <Menu inverted size="large" className={styles.menu}>
        {project && (
          <Menu.Menu position="left">
            <Tooltip content={t('action.returnToProjects')}>
              <Menu.Item
                as={Link}
                to={Paths.ROOT}
                className={classNames(styles.item, styles.itemHoverable)}
              >
                <Icon fitted name="arrow left" />
              </Menu.Item>
            </Tooltip>
            <Menu.Item className={classNames(styles.item, styles.title)}>
              {project.name}
              {canEditProject && (
                <Tooltip content={t('common.openProjectSettings')}>
                  <Button className={styles.editButton} onClick={handleProjectSettingsClick}>
                    <Icon fitted name="pencil" size="small" />
                  </Button>
                </Tooltip>
              )}
            </Menu.Item>
          </Menu.Menu>
        )}
        <Menu.Menu position="right">
          {withFavoritesToggler && (
            <Tooltip
              content={t(isFavoritesEnabled ? 'action.hideProjectList' : 'action.showProjectList')}
            >
              <Menu.Item
                className={classNames(styles.item, styles.itemHoverable)}
                onClick={handleToggleFavoritesClick}
              >
                <Icon
                  fitted
                  name={isFavoritesEnabled ? 'star' : 'star outline'}
                  className={classNames(isFavoritesEnabled && styles.itemIconEnabled)}
                />
              </Menu.Item>
            </Tooltip>
          )}
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
          <UserActionsPopup>
            <Menu.Item className={classNames(styles.item, styles.itemHoverable)}>
              <span className={styles.userName}>{user.name}</span>
              <UserAvatar id={user.id} size="small" />
            </Menu.Item>
          </UserActionsPopup>
        </Menu.Menu>
      </Menu>
    </div>
  );
});

export default Header;
