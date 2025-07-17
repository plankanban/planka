/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Menu } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { UserRoles } from '../../../constants/Enums';

import styles from './UserStep.module.scss';

const UserStep = React.memo(({ onClose }) => {
  const isLogouting = useSelector(selectors.selectIsLogouting);

  const withAdministration = useSelector(
    (state) => selectors.selectCurrentUser(state).role === UserRoles.ADMIN,
  );

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleSettingsClick = useCallback(() => {
    dispatch(entryActions.openUserSettingsModal());
    onClose();
  }, [onClose, dispatch]);

  const handleAdministrationClick = useCallback(() => {
    dispatch(entryActions.openAdministrationModal());
    onClose();
  }, [onClose, dispatch]);

  const handleLogoutClick = useCallback(() => {
    dispatch(entryActions.logout());
  }, [dispatch]);

  let logoutMenuItemProps;
  if (isLogouting) {
    logoutMenuItemProps = {
      as: Button,
      fluid: true,
      basic: true,
      loading: true,
      disabled: true,
    };
  }

  return (
    <>
      <Popup.Header>
        {t('common.userActions', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          <Menu.Item className={styles.menuItem} onClick={handleSettingsClick}>
            <Icon name="user" className={styles.menuItemIcon} />
            {t('common.settings', {
              context: 'title',
            })}
          </Menu.Item>
          {withAdministration && (
            <Menu.Item className={styles.menuItem} onClick={handleAdministrationClick}>
              <Icon name="setting" className={styles.menuItemIcon} />
              {t('common.administration', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          <hr className={styles.divider} />
          <Menu.Item
            {...logoutMenuItemProps} // eslint-disable-line react/jsx-props-no-spreading
            className={styles.menuItem}
            onClick={handleLogoutClick}
          >
            <Icon name="log out" className={styles.menuItemIcon} />
            {t('action.logOut', {
              context: 'title',
            })}
          </Menu.Item>
        </Menu>
      </Popup.Content>
    </>
  );
});

UserStep.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default UserStep;
