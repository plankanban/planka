import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Dropdown, Header, Tab } from 'semantic-ui-react';
import { usePopup } from '../../../lib/popup';

import locales from '../../../locales';
import AvatarEditStep from './AvatarEditStep';
import User from '../../User';
import UserInformationEdit from '../../UserInformationEdit';
import UserUsernameEditStep from '../../UserUsernameEditStep';
import UserEmailEditStep from '../../UserEmailEditStep';
import UserPasswordEditStep from '../../UserPasswordEditStep';

import styles from './AccountPane.module.scss';

const AccountPane = React.memo(
  ({
    email,
    name,
    username,
    avatarUrl,
    phone,
    organization,
    language,
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
  }) => {
    const [t] = useTranslation();

    const handleAvatarDelete = useCallback(() => {
      onUpdate({
        avatarUrl: null,
      });
    }, [onUpdate]);

    const handleLanguageChange = useCallback(
      (_, { value }) => {
        onLanguageUpdate(value === 'auto' ? null : value); // FIXME: hack
      },
      [onLanguageUpdate],
    );

    const AvatarEditPopup = usePopup(AvatarEditStep);
    const UserUsernameEditPopup = usePopup(UserUsernameEditStep);
    const UserEmailEditPopup = usePopup(UserEmailEditStep);
    const UserPasswordEditPopup = usePopup(UserPasswordEditStep);

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
        <UserInformationEdit
          defaultData={{
            name,
            phone,
            organization,
          }}
          isNameEditable={!isLocked}
          onUpdate={onUpdate}
        />
        <Divider horizontal section>
          <Header as="h4">
            {t('common.language', {
              context: 'title',
            })}
          </Header>
        </Divider>
        <Dropdown
          fluid
          selection
          options={[
            {
              key: 'auto',
              value: 'auto',
              text: t('common.detectAutomatically'),
            },
            ...locales.map((locale) => ({
              key: locale.language,
              value: locale.language,
              flag: locale.country,
              text: locale.name,
            })),
          ]}
          value={language || 'auto'}
          onChange={handleLanguageChange}
        />
        {(!isLocked || !isUsernameLocked) && (
          <>
            <Divider horizontal section>
              <Header as="h4">
                {t('common.authentication', {
                  context: 'title',
                })}
              </Header>
            </Divider>
            {!isUsernameLocked && (
              <div className={styles.action}>
                <UserUsernameEditPopup
                  defaultData={usernameUpdateForm.data}
                  username={username}
                  isSubmitting={usernameUpdateForm.isSubmitting}
                  error={usernameUpdateForm.error}
                  usePasswordConfirmation={!isLocked} // FIXME: hack
                  onUpdate={onUsernameUpdate}
                  onMessageDismiss={onUsernameUpdateMessageDismiss}
                >
                  <Button className={styles.actionButton}>
                    {t('action.editUsername', {
                      context: 'title',
                    })}
                  </Button>
                </UserUsernameEditPopup>
              </div>
            )}
            {!isLocked && (
              <>
                <div className={styles.action}>
                  <UserEmailEditPopup
                    usePasswordConfirmation
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
                  </UserEmailEditPopup>
                </div>
                <div className={styles.action}>
                  <UserPasswordEditPopup
                    usePasswordConfirmation
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
                  </UserPasswordEditPopup>
                </div>
              </>
            )}
          </>
        )}
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
  language: PropTypes.string,
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
};

AccountPane.defaultProps = {
  username: undefined,
  avatarUrl: undefined,
  phone: undefined,
  organization: undefined,
  language: undefined,
};

export default AccountPane;
