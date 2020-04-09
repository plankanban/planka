import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Header, Tab } from 'semantic-ui-react';

import EditInformation from './EditInformation';
import EditAvatarPopup from './EditAvatarPopup';
import EditUsernamePopup from './EditUsernamePopup';
import EditEmailPopup from './EditEmailPopup';
import EditPasswordPopup from './EditPasswordPopup';
import User from '../../User';

import styles from './AccountPane.module.css';

const AccountPane = React.memo(
  ({
    email,
    name,
    username,
    avatar,
    phone,
    organization,
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
  }) => {
    const [t] = useTranslation();

    const handleAvatarDelete = useCallback(() => {
      onUpdate({
        avatar: null,
      });
    }, [onUpdate]);

    return (
      <Tab.Pane attached={false} className={styles.wrapper}>
        <EditAvatarPopup
          defaultValue={avatar}
          onUpload={onAvatarUpload}
          onDelete={handleAvatarDelete}
        >
          <User name={name} avatar={avatar} size="massive" isDisabled={isAvatarUploading} />
        </EditAvatarPopup>
        <br />
        <br />
        <EditInformation
          defaultData={{
            name,
            phone,
            organization,
          }}
          onUpdate={onUpdate}
        />
        <Divider horizontal section>
          <Header as="h4">
            {t('common.authentication', {
              context: 'title',
            })}
          </Header>
        </Divider>
        <div className={styles.action}>
          <EditUsernamePopup
            defaultData={usernameUpdateForm.data}
            username={username}
            isSubmitting={usernameUpdateForm.isSubmitting}
            error={usernameUpdateForm.error}
            onUpdate={onUsernameUpdate}
            onMessageDismiss={onUsernameUpdateMessageDismiss}
          >
            <Button className={styles.actionButton}>
              {t('action.editUsername', {
                context: 'title',
              })}
            </Button>
          </EditUsernamePopup>
        </div>
        <div className={styles.action}>
          <EditEmailPopup
            defaultData={emailUpdateForm.data}
            email={email}
            isSubmitting={emailUpdateForm.isSubmitting}
            error={emailUpdateForm.error}
            onUpdate={onEmailUpdate}
            onMessageDismiss={onEmailUpdateMessageDismiss}
          >
            <Button className={styles.actionButton}>
              {t('action.editEmail', {
                context: 'title',
              })}
            </Button>
          </EditEmailPopup>
        </div>
        <div className={styles.action}>
          <EditPasswordPopup
            defaultData={passwordUpdateForm.data}
            isSubmitting={passwordUpdateForm.isSubmitting}
            error={passwordUpdateForm.error}
            onUpdate={onPasswordUpdate}
            onMessageDismiss={onPasswordUpdateMessageDismiss}
          >
            <Button className={styles.actionButton}>
              {t('action.editPassword', {
                context: 'title',
              })}
            </Button>
          </EditPasswordPopup>
        </div>
      </Tab.Pane>
    );
  },
);

AccountPane.propTypes = {
  email: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  username: PropTypes.string,
  avatar: PropTypes.string,
  phone: PropTypes.string,
  organization: PropTypes.string,
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
};

AccountPane.defaultProps = {
  username: undefined,
  avatar: undefined,
  phone: undefined,
  organization: undefined,
};

export default AccountPane;
