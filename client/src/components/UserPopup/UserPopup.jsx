import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Menu } from 'semantic-ui-react';
import { withPopup } from '../../lib/popup';
import { Popup } from '../../lib/custom-ui';

import { useSteps } from '../../hooks';
import EditNameStep from './EditNameStep';
import EditUsernameStep from './EditUsernameStep';
import EditAvatarStep from './EditAvatarStep';
import EditEmailStep from './EditEmailStep';
import EditPasswordStep from './EditPasswordStep';

import styles from './UserPopup.module.css';

const StepTypes = {
  EDIT_NAME: 'EDIT_NAME',
  EDIT_USERNAME: 'EDIT_USERNAME',
  EDIT_AVATAR: 'EDIT_AVATAR',
  EDIT_EMAIL: 'EDIT_EMAIL',
  EDIT_PASSWORD: 'EDIT_PASSWORD',
};

const UserStep = React.memo(
  ({
    email,
    name,
    username,
    avatar,
    isAvatarUploading,
    usernameUpdateForm,
    emailUpdateForm,
    passwordUpdateForm,
    onUpdate,
    onAvatarUpload,
    onUsernameUpdate,
    onUsernameUpdateMessageDismiss,
    onEmailUpdate,
    onEmailUpdateMessageDismiss,
    onPasswordUpdate,
    onPasswordUpdateMessageDismiss,
    onLogout,
    onClose,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    const handleNameEditClick = useCallback(() => {
      openStep(StepTypes.EDIT_NAME);
    }, [openStep]);

    const handleAvatarEditClick = useCallback(() => {
      openStep(StepTypes.EDIT_AVATAR);
    }, [openStep]);

    const handleUsernameEditClick = useCallback(() => {
      openStep(StepTypes.EDIT_USERNAME);
    }, [openStep]);

    const handleEmailEditClick = useCallback(() => {
      openStep(StepTypes.EDIT_EMAIL);
    }, [openStep]);

    const handlePasswordEditClick = useCallback(() => {
      openStep(StepTypes.EDIT_PASSWORD);
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
        case StepTypes.EDIT_USERNAME:
          return (
            <EditUsernameStep
              defaultData={usernameUpdateForm.data}
              username={username}
              isSubmitting={usernameUpdateForm.isSubmitting}
              error={usernameUpdateForm.error}
              onUpdate={onUsernameUpdate}
              onMessageDismiss={onUsernameUpdateMessageDismiss}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.EDIT_EMAIL:
          return (
            <EditEmailStep
              defaultData={emailUpdateForm.data}
              email={email}
              isSubmitting={emailUpdateForm.isSubmitting}
              error={emailUpdateForm.error}
              onUpdate={onEmailUpdate}
              onMessageDismiss={onEmailUpdateMessageDismiss}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.EDIT_PASSWORD:
          return (
            <EditPasswordStep
              defaultData={passwordUpdateForm.data}
              isSubmitting={passwordUpdateForm.isSubmitting}
              error={passwordUpdateForm.error}
              onUpdate={onPasswordUpdate}
              onMessageDismiss={onPasswordUpdateMessageDismiss}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        default:
      }
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
            <Menu.Item className={styles.menuItem} onClick={handleUsernameEditClick}>
              {t('action.editUsername', {
                context: 'title',
              })}
            </Menu.Item>
            <Menu.Item className={styles.menuItem} onClick={handleEmailEditClick}>
              {t('action.editEmail', {
                context: 'title',
              })}
            </Menu.Item>
            <Menu.Item className={styles.menuItem} onClick={handlePasswordEditClick}>
              {t('action.editPassword', {
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
  email: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  username: PropTypes.string,
  avatar: PropTypes.string,
  isAvatarUploading: PropTypes.bool.isRequired,
  /* eslint-disable react/forbid-prop-types */
  usernameUpdateForm: PropTypes.object.isRequired,
  emailUpdateForm: PropTypes.object.isRequired,
  passwordUpdateForm: PropTypes.object.isRequired,
  /* eslint-enable react/forbid-prop-types */
  onUpdate: PropTypes.func.isRequired,
  onAvatarUpload: PropTypes.func.isRequired,
  onUsernameUpdate: PropTypes.func.isRequired,
  onUsernameUpdateMessageDismiss: PropTypes.func.isRequired,
  onEmailUpdate: PropTypes.func.isRequired,
  onEmailUpdateMessageDismiss: PropTypes.func.isRequired,
  onPasswordUpdate: PropTypes.func.isRequired,
  onPasswordUpdateMessageDismiss: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

UserStep.defaultProps = {
  username: undefined,
  avatar: undefined,
};

export default withPopup(UserStep);
