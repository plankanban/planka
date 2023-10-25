import pick from 'lodash/pick';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Menu } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import { useSteps } from '../../../hooks';
import UserInformationEditStep from '../../UserInformationEditStep';
import UserUsernameEditStep from '../../UserUsernameEditStep';
import UserEmailEditStep from '../../UserEmailEditStep';
import UserPasswordEditStep from '../../UserPasswordEditStep';
import DeleteStep from '../../DeleteStep';

import styles from './ActionsStep.module.scss';

const StepTypes = {
  EDIT_INFORMATION: 'EDIT_INFORMATION',
  EDIT_USERNAME: 'EDIT_USERNAME',
  EDIT_EMAIL: 'EDIT_EMAIL',
  EDIT_PASSWORD: 'EDIT_PASSWORD',
  DELETE: 'DELETE',
};

const ActionsStep = React.memo(
  ({
    user,
    onUpdate,
    onUsernameUpdate,
    onUsernameUpdateMessageDismiss,
    onEmailUpdate,
    onEmailUpdateMessageDismiss,
    onPasswordUpdate,
    onPasswordUpdateMessageDismiss,
    onDelete,
    onClose,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    const handleEditInformationClick = useCallback(() => {
      openStep(StepTypes.EDIT_INFORMATION);
    }, [openStep]);

    const handleEditUsernameClick = useCallback(() => {
      openStep(StepTypes.EDIT_USERNAME);
    }, [openStep]);

    const handleEditEmailClick = useCallback(() => {
      openStep(StepTypes.EDIT_EMAIL);
    }, [openStep]);

    const handleEditPasswordClick = useCallback(() => {
      openStep(StepTypes.EDIT_PASSWORD);
    }, [openStep]);

    const handleDeleteClick = useCallback(() => {
      openStep(StepTypes.DELETE);
    }, [openStep]);

    if (step) {
      switch (step.type) {
        case StepTypes.EDIT_INFORMATION:
          return (
            <UserInformationEditStep
              defaultData={pick(user, ['name', 'phone', 'organization'])}
              isNameEditable={!user.isLocked}
              onUpdate={onUpdate}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.EDIT_USERNAME:
          return (
            <UserUsernameEditStep
              defaultData={user.usernameUpdateForm.data}
              username={user.username}
              isSubmitting={user.usernameUpdateForm.isSubmitting}
              error={user.usernameUpdateForm.error}
              onUpdate={onUsernameUpdate}
              onMessageDismiss={onUsernameUpdateMessageDismiss}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.EDIT_EMAIL:
          return (
            <UserEmailEditStep
              defaultData={user.emailUpdateForm.data}
              email={user.email}
              isSubmitting={user.emailUpdateForm.isSubmitting}
              error={user.emailUpdateForm.error}
              onUpdate={onEmailUpdate}
              onMessageDismiss={onEmailUpdateMessageDismiss}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.EDIT_PASSWORD:
          return (
            <UserPasswordEditStep
              defaultData={user.passwordUpdateForm.data}
              isSubmitting={user.passwordUpdateForm.isSubmitting}
              error={user.passwordUpdateForm.error}
              onUpdate={onPasswordUpdate}
              onMessageDismiss={onPasswordUpdateMessageDismiss}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.DELETE:
          return (
            <DeleteStep
              title="common.deleteUser"
              content="common.areYouSureYouWantToDeleteThisUser"
              buttonContent="action.deleteUser"
              onConfirm={onDelete}
              onBack={handleBack}
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
            <Menu.Item className={styles.menuItem} onClick={handleEditInformationClick}>
              {t('action.editInformation', {
                context: 'title',
              })}
            </Menu.Item>
            {!user.isLocked && (
              <>
                <Menu.Item className={styles.menuItem} onClick={handleEditUsernameClick}>
                  {t('action.editUsername', {
                    context: 'title',
                  })}
                </Menu.Item>
                <Menu.Item className={styles.menuItem} onClick={handleEditEmailClick}>
                  {t('action.editEmail', {
                    context: 'title',
                  })}
                </Menu.Item>
                <Menu.Item className={styles.menuItem} onClick={handleEditPasswordClick}>
                  {t('action.editPassword', {
                    context: 'title',
                  })}
                </Menu.Item>
              </>
            )}
            {!user.isDeletionLocked && (
              <Menu.Item className={styles.menuItem} onClick={handleDeleteClick}>
                {t('action.deleteUser', {
                  context: 'title',
                })}
              </Menu.Item>
            )}
          </Menu>
        </Popup.Content>
      </>
    );
  },
);

ActionsStep.propTypes = {
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onUsernameUpdate: PropTypes.func.isRequired,
  onUsernameUpdateMessageDismiss: PropTypes.func.isRequired,
  onEmailUpdate: PropTypes.func.isRequired,
  onEmailUpdateMessageDismiss: PropTypes.func.isRequired,
  onPasswordUpdate: PropTypes.func.isRequired,
  onPasswordUpdateMessageDismiss: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ActionsStep;
