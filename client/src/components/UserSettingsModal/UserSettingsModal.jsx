import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Modal, Tab } from 'semantic-ui-react';

import AccountPane from './AccountPane';

const UserSettingsModal = React.memo(
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
            avatar={avatar}
            phone={phone}
            organization={organization}
            isAvatarUploading={isAvatarUploading}
            usernameUpdateForm={usernameUpdateForm}
            emailUpdateForm={emailUpdateForm}
            passwordUpdateForm={passwordUpdateForm}
            onUpdate={onUpdate}
            onAvatarUpload={onAvatarUpload}
            onUsernameUpdate={onUsernameUpdate}
            onUsernameUpdateMessageDismiss={onUsernameUpdateMessageDismiss}
            onEmailUpdate={onEmailUpdate}
            onEmailUpdateMessageDismiss={onEmailUpdateMessageDismiss}
            onPasswordUpdate={onPasswordUpdate}
            onPasswordUpdateMessageDismiss={onPasswordUpdateMessageDismiss}
          />
        ),
      },
    ];

    return (
      <Modal open closeIcon size="small" centered={false} onClose={onClose}>
        <Modal.Content>
          <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
        </Modal.Content>
      </Modal>
    );
  },
);

UserSettingsModal.propTypes = {
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
  onClose: PropTypes.func.isRequired,
};

UserSettingsModal.defaultProps = {
  username: undefined,
  avatar: undefined,
  phone: undefined,
  organization: undefined,
};

export default UserSettingsModal;
