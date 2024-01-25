import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Modal, Tab } from 'semantic-ui-react';

import AccountPane from './AccountPane';
import PreferencesPane from './PreferencesPane';
import AboutPane from './AboutPane';

const UserSettingsModal = React.memo(
  ({
    email,
    name,
    username,
    avatarUrl,
    phone,
    organization,
    language,
    subscribeToOwnCards,
    isLocked,
    isUsernameLocked,
    isAvatarUpdating,
    usernameUpdateForm,
    emailUpdateForm,
    passwordUpdateForm,
    onUpdate,
    onAvatarUpdate,
    onLanguageUpdate,
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
            language={language}
            isLocked={isLocked}
            isUsernameLocked={isUsernameLocked}
            isAvatarUpdating={isAvatarUpdating}
            usernameUpdateForm={usernameUpdateForm}
            emailUpdateForm={emailUpdateForm}
            passwordUpdateForm={passwordUpdateForm}
            onUpdate={onUpdate}
            onAvatarUpdate={onAvatarUpdate}
            onLanguageUpdate={onLanguageUpdate}
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
      {
        menuItem: t('common.aboutPlanka', {
          context: 'title',
        }),
        render: () => <AboutPane />,
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
  language: PropTypes.string,
  subscribeToOwnCards: PropTypes.bool.isRequired,
  isLocked: PropTypes.bool.isRequired,
  isUsernameLocked: PropTypes.bool.isRequired,
  isAvatarUpdating: PropTypes.bool.isRequired,
  /* eslint-disable react/forbid-prop-types */
  usernameUpdateForm: PropTypes.object.isRequired,
  emailUpdateForm: PropTypes.object.isRequired,
  passwordUpdateForm: PropTypes.object.isRequired,
  /* eslint-enable react/forbid-prop-types */
  onUpdate: PropTypes.func.isRequired,
  onAvatarUpdate: PropTypes.func.isRequired,
  onLanguageUpdate: PropTypes.func.isRequired,
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
  language: undefined,
};

export default UserSettingsModal;
