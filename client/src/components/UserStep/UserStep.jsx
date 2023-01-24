import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Menu } from 'semantic-ui-react';
import { Popup } from '../../lib/custom-ui';

import styles from './UserStep.module.scss';

const UserStep = React.memo(({ isLogouting, onSettingsClick, onLogout, onClose }) => {
  const [t] = useTranslation();

  const handleSettingsClick = useCallback(() => {
    onSettingsClick();
    onClose();
  }, [onSettingsClick, onClose]);

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
            {t('common.settings', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item
            {...logoutMenuItemProps} // eslint-disable-line react/jsx-props-no-spreading
            className={styles.menuItem}
            onClick={onLogout}
          >
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
  isLogouting: PropTypes.bool.isRequired,
  onSettingsClick: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default UserStep;
