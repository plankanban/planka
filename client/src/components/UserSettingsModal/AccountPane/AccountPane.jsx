import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Header, Tab } from 'semantic-ui-react';

import InformationEdit from './InformationEdit';
import AvatarEditPopup from './AvatarEditPopup';
import UsernameEditPopup from './UsernameEditPopup';
import EmailEditPopup from './EmailEditPopup';
import PasswordEditPopup from './PasswordEditPopup';
import User from '../../User';

import styles from './AccountPane.module.scss';

const AccountPane = React.memo(
  ({
    email,
    name,
    username,
    avatarUrl,
    phone,
    organization,
    isAvatarUpdating,
    usernameUpdateForm,
    emailUpdateForm,
    passwordUpdateForm,
    onUpdate,
    onAvatarUpdate,
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
        avatarUrl: null,
      });
    }, [onUpdate]);

    return (
      <Tab.Pane attached={false} className={styles.wrapper}>
        <AvatarEditPopup
          defaultValue={avatarUrl}
          onUpdate={onAvatarUpdate}
          onDelete={handleAvatarDelete}
        >
          <User name={name} avatarUrl={avatarUrl} size="massive" isDisabled={isAvatarUpdating} />
        </AvatarEditPopup>
        <br />
        <br />
        <InformationEdit
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
          <UsernameEditPopup
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
          </UsernameEditPopup>
        </div>
        <div className={styles.action}>
          <EmailEditPopup
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
          </EmailEditPopup>
        </div>
        <div className={styles.action}>
          <PasswordEditPopup
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
          </PasswordEditPopup>
        </div>
      </Tab.Pane>
    );
  },
);

AccountPane.propTypes = {
  email: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  username: PropTypes.string,
  avatarUrl: PropTypes.string,
  phone: PropTypes.string,
  organization: PropTypes.string,
  isAvatarUpdating: PropTypes.bool.isRequired,
  /* eslint-disable react/forbid-prop-types */
  usernameUpdateForm: PropTypes.object.isRequired,
  emailUpdateForm: PropTypes.object.isRequired,
  passwordUpdateForm: PropTypes.object.isRequired,
  /* eslint-enable react/forbid-prop-types */
  onUpdate: PropTypes.func.isRequired,
  onAvatarUpdate: PropTypes.func.isRequired,
  onUsernameUpdate: PropTypes.func.isRequired,
  onUsernameUpdateMessageDismiss: PropTypes.func.isRequired,
  onEmailUpdate: PropTypes.func.isRequired,
  onEmailUpdateMessageDismiss: PropTypes.func.isRequired,
  onPasswordUpdate: PropTypes.func.isRequired,
  onPasswordUpdateMessageDismiss: PropTypes.func.isRequired,
};

AccountPane.defaultProps = {
  username: undefined,
  avatarUrl: undefined,
  phone: undefined,
  organization: undefined,
};

export default AccountPane;
