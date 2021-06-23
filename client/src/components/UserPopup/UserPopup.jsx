import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Menu } from 'semantic-ui-react';
import { withPopup } from '../../lib/popup';
import { Popup } from '../../lib/custom-ui';

import styles from './UserPopup.module.scss';

const UserStep = React.memo(({ onSettingsClick, onLogout, onClose }) => {
  const [t] = useTranslation();

  const handleSettingsClick = useCallback(() => {
    onSettingsClick();
    onClose();
  }, [onSettingsClick, onClose]);

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
          <Menu.Item className={styles.menuItem} onClick={onLogout}>
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
  onSettingsClick: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(UserStep, {
  position: 'bottom right',
});
