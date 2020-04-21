import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Modal, Tab } from 'semantic-ui-react';

import AccountPane from './AccountPane';
import PreferencesPane from './PreferencesPane';

const UserSettingsModal = React.memo(
  ({
    email,
    name,
    username,
    avatarUrl,
    phone,
    organization,
    subscribeToOwnCards,
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
    onClose,
  }) => {
    const [t] = useTranslation();

    const panes = [
      {
        menuItem: t('common.account', {
          context: 'title',
        }),
        render: () => (
          <AccountPane
            email={email}
            name={name}
            username={username}
            avatarUrl={avatarUrl}
            phone={phone}
            organization={organization}
            isAvatarUpdating={isAvatarUpdating}
            usernameUpdateForm={usernameUpdateForm}
            emailUpdateForm={emailUpdateForm}
            passwordUpdateForm={passwordUpdateForm}
            onUpdate={onUpdate}
            onAvatarUpdate={onAvatarUpdate}
            onUsernameUpdate={onUsernameUpdate}
            onUsernameUpdateMessageDismiss={onUsernameUpdateMessageDismiss}
            onEmailUpdate={onEmailUpdate}
            onEmailUpdateMessageDismiss={onEmailUpdateMessageDismiss}
            onPasswordUpdate={onPasswordUpdate}
            onPasswordUpdateMessageDismiss={onPasswordUpdateMessageDismiss}
          />
        ),
      },
      {
        menuItem: t('common.preferences', {
          context: 'title',
        }),
        render: () => (
          <PreferencesPane subscribeToOwnCards={subscribeToOwnCards} onUpdate={onUpdate} />
        ),
      },
    ];

    return (
      <Modal open closeIcon size="small" centered={false} onClose={onClose}>
        <Modal.Content>
          <Tab
            menu={{
              secondary: true,
              pointing: true,
            }}
            panes={panes}
          />
        </Modal.Content>
      </Modal>
    );
  },
);

UserSettingsModal.propTypes = {
  email: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  username: PropTypes.string,
  avatarUrl: PropTypes.string,
  phone: PropTypes.string,
  organization: PropTypes.string,
  subscribeToOwnCards: PropTypes.bool.isRequired,
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
  onClose: PropTypes.func.isRequired,
};

UserSettingsModal.defaultProps = {
  username: undefined,
  avatarUrl: undefined,
  phone: undefined,
  organization: undefined,
};

export default UserSettingsModal;
