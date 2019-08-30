import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Menu } from 'semantic-ui-react';
import { withPopup } from '../../../lib/popup';
import { Popup } from '../../../lib/custom-ui';

import { useSteps } from '../../../hooks';
import EditNameStep from './EditNameStep';
import EditAvatarStep from './EditAvatarStep';

import styles from './UserPopup.module.css';

const StepTypes = {
  EDIT_NAME: 'EDIT_NAME',
  EDIT_AVATAR: 'EDIT_AVATAR',
};

const UserStep = React.memo(
  ({
    name, avatar, isAvatarUploading, onUpdate, onAvatarUpload, onLogout, onClose,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    const handleNameEditClick = useCallback(() => {
      openStep(StepTypes.EDIT_NAME);
    }, [openStep]);

    const handleAvatarEditClick = useCallback(() => {
      openStep(StepTypes.EDIT_AVATAR);
    }, [openStep]);

    const handleNameUpdate = useCallback(
      (newName) => {
        onUpdate({
          name: newName,
        });
      },
      [onUpdate],
    );

    const handleAvatarClear = useCallback(() => {
      onUpdate({
        avatar: null,
      });
    }, [onUpdate]);

    if (step) {
      switch (step.type) {
        case StepTypes.EDIT_NAME:
          return (
            <EditNameStep
              defaultValue={name}
              onUpdate={handleNameUpdate}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.EDIT_AVATAR:
          return (
            <EditAvatarStep
              defaultValue={avatar}
              name={name}
              isUploading={isAvatarUploading}
              onUpload={onAvatarUpload}
              onClear={handleAvatarClear}
              onBack={handleBack}
            />
          );
        default:
      }
    }

    return (
      <>
        <Popup.Header>{name}</Popup.Header>
        <Popup.Content>
          <Menu secondary vertical className={styles.menu}>
            <Menu.Item className={styles.menuItem} onClick={handleNameEditClick}>
              {t('action.editName', {
                context: 'title',
              })}
            </Menu.Item>
            <Menu.Item className={styles.menuItem} onClick={handleAvatarEditClick}>
              {t('action.editAvatar', {
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
  },
);

UserStep.propTypes = {
  name: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  isAvatarUploading: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onAvatarUpload: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

UserStep.defaultProps = {
  avatar: undefined,
};

export default withPopup(UserStep);
