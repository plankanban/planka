/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import isEmail from 'validator/lib/isEmail';
import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Form, Icon, Message, Tab } from 'semantic-ui-react';
import { FilePicker, Input } from '../../../../lib/custom-ui';
import { useDidUpdate, usePrevious } from '../../../../lib/hooks';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { useForm } from '../../../../hooks';
import { isUsername, isPassword } from '../../../../utils/validator';
import UserAvatar from '../../../users/UserAvatar';
import TotpAdminResetModal from './TotpAdminResetModal';

import styles from './ProfilePane.module.scss';

const ERROR_MESSAGE_BY_KEY = {
  'Email already in use': { type: 'error', content: 'common.emailAlreadyInUse' },
  'Username already in use': { type: 'error', content: 'common.usernameAlreadyInUse' },
  'Invalid current password': { type: 'error', content: 'common.invalidCurrentPassword' },
};

const buildMessage = (error) => {
  if (!error) return null;
  return ERROR_MESSAGE_BY_KEY[error.message] || { type: 'warning', content: 'common.unknownError' };
};

const ProfilePane = React.memo(({ userId }) => {
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);
  const user = useSelector((state) => selectUserById(state, userId));

  const isCurrentUser = useSelector((state) => userId === selectors.selectCurrentUserId(state));
  const withPasswordConfirmation = isCurrentUser;

  const {
    emailUpdateForm: { isSubmitting: isEmailSubmitting, error: emailError },
    usernameUpdateForm: { isSubmitting: isUsernameSubmitting, error: usernameError },
    passwordUpdateForm: { isSubmitting: isPasswordSubmitting, error: passwordError },
  } = user;
  const isSubmitting = isEmailSubmitting || isUsernameSubmitting || isPasswordSubmitting;

  const wasUsernameSubmitting = usePrevious(isUsernameSubmitting);
  const wasEmailSubmitting = usePrevious(isEmailSubmitting);
  const wasPasswordSubmitting = usePrevious(isPasswordSubmitting);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [isUsernameUnlocked, setIsUsernameUnlocked] = useState(!user.username);
  const [isEmailUnlocked, setIsEmailUnlocked] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isTotpResetModalOpen, setIsTotpResetModalOpen] = useState(false);

  const defaultInfoData = useMemo(
    () => ({
      name: user.name,
      phone: user.phone,
      organization: user.organization,
    }),
    [user.name, user.phone, user.organization],
  );

  const [data, handleFieldChange, setData] = useForm(() => ({
    name: defaultInfoData.name || '',
    phone: defaultInfoData.phone || '',
    organization: defaultInfoData.organization || '',
    username: user.username || '',
    email: user.email || '',
    newPassword: '',
    confirmPassword: '',
  }));

  const cleanData = useMemo(
    () => ({
      name: data.name.trim(),
      phone: data.phone.trim() || null,
      organization: data.organization.trim() || null,
      username: data.username.trim() || null,
      email: data.email.trim(),
      newPassword: data.newPassword,
    }),
    [data],
  );

  const infoChanged = useMemo(
    () =>
      !dequal(
        {
          name: cleanData.name,
          phone: cleanData.phone,
          organization: cleanData.organization,
        },
        defaultInfoData,
      ),
    [cleanData, defaultInfoData],
  );

  const usernameChanged = cleanData.username !== (user.username || null);
  const emailChanged = cleanData.email !== user.email;
  const passwordEntered =
    cleanData.newPassword.length > 0 && cleanData.newPassword === data.confirmPassword;
  const credentialsChanged = usernameChanged || emailChanged || passwordEntered;
  const anyChanged = infoChanged || credentialsChanged;

  const handleAvatarFileSelect = useCallback(
    (file) => {
      dispatch(entryActions.updateUserAvatar(userId, { file }));
    },
    [userId, dispatch],
  );

  const handleAvatarDeleteClick = useCallback(() => {
    dispatch(entryActions.updateUser(userId, { avatar: null }));
  }, [userId, dispatch]);

  const handleCurrentPasswordChange = useCallback((_, { value }) => {
    setCurrentPassword(value);
  }, []);

  const handleUnlockUsername = useCallback(() => {
    setIsUsernameUnlocked(true);
  }, []);

  const handleCancelUsername = useCallback(() => {
    setData((prev) => ({ ...prev, username: user.username || '' }));
    setIsUsernameUnlocked(false);
  }, [setData, user.username]);

  const handleUnlockEmail = useCallback(() => {
    setIsEmailUnlocked(true);
  }, []);

  const handleCancelEmail = useCallback(() => {
    setData((prev) => ({ ...prev, email: user.email || '' }));
    setIsEmailUnlocked(false);
  }, [setData, user.email]);

  const handleTogglePassword = useCallback(() => {
    setIsPasswordVisible(true);
  }, []);

  const handleCancelPassword = useCallback(() => {
    setData((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
    setIsPasswordVisible(false);
  }, [setData]);

  const usernameMessage = useMemo(() => buildMessage(usernameError), [usernameError]);
  const emailMessage = useMemo(() => buildMessage(emailError), [emailError]);
  const passwordMessage = useMemo(() => buildMessage(passwordError), [passwordError]);

  const handleDismissUsernameError = useCallback(() => {
    dispatch(entryActions.clearUserUsernameUpdateError(userId));
  }, [userId, dispatch]);

  const handleDismissEmailError = useCallback(() => {
    dispatch(entryActions.clearUserEmailUpdateError(userId));
  }, [userId, dispatch]);

  const handleDismissPasswordError = useCallback(() => {
    dispatch(entryActions.clearUserPasswordUpdateError(userId));
  }, [userId, dispatch]);

  useDidUpdate(() => {
    if (wasUsernameSubmitting && !isUsernameSubmitting && !usernameError) {
      setIsUsernameUnlocked(false);
    }
  }, [isUsernameSubmitting, wasUsernameSubmitting, usernameError]);

  useDidUpdate(() => {
    if (wasEmailSubmitting && !isEmailSubmitting && !emailError) {
      setIsEmailUnlocked(false);
    }
  }, [isEmailSubmitting, wasEmailSubmitting, emailError]);

  useDidUpdate(() => {
    if (wasPasswordSubmitting && !isPasswordSubmitting && !passwordError) {
      setData((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
      setIsPasswordVisible(false);
    }
  }, [isPasswordSubmitting, wasPasswordSubmitting, passwordError]);

  useDidUpdate(() => {
    const isInvalidPw = (e) => e && e.message === 'Invalid current password';
    if (isInvalidPw(usernameError) || isInvalidPw(emailError) || isInvalidPw(passwordError)) {
      setCurrentPassword('');
    }
  }, [usernameError, emailError, passwordError]);

  const handleSubmit = useCallback(() => {
    const isNameEditable = !user.lockedFieldNames.includes('name');

    if (isNameEditable && !cleanData.name) return;

    if (infoChanged) {
      const infoData = {
        phone: cleanData.phone,
        organization: cleanData.organization,
      };
      if (isNameEditable) {
        infoData.name = cleanData.name;
      }
      dispatch(entryActions.updateUser(userId, infoData));
    }

    const pw = withPasswordConfirmation ? currentPassword : undefined;

    if (usernameChanged && cleanData.username && isUsername(cleanData.username)) {
      const usernameData = { username: cleanData.username };
      if (pw !== undefined) usernameData.currentPassword = pw;
      dispatch(entryActions.updateUserUsername(userId, usernameData));
    }

    if (emailChanged && isEmail(cleanData.email)) {
      const emailData = { email: cleanData.email };
      if (pw !== undefined) emailData.currentPassword = pw;
      dispatch(entryActions.updateUserEmail(userId, emailData));
    }

    if (passwordEntered && isPassword(cleanData.newPassword)) {
      const passwordData = { password: cleanData.newPassword };
      if (pw !== undefined) passwordData.currentPassword = pw;
      dispatch(entryActions.updateUserPassword(userId, passwordData));
    }
  }, [
    userId,
    user.lockedFieldNames,
    withPasswordConfirmation,
    currentPassword,
    infoChanged,
    usernameChanged,
    emailChanged,
    passwordEntered,
    cleanData,
    dispatch,
  ]);

  const isNameEditable = !user.lockedFieldNames.includes('name');
  const isUsernameEditable = !user.lockedFieldNames.includes('username');
  const isEmailEditable = !user.lockedFieldNames.includes('email');

  return (
    <Tab.Pane attached={false} className={styles.pane}>
      <div className={styles.avatarArea}>
        <UserAvatar id={userId} size="massive" />
        <div className={styles.avatarButtons}>
          <FilePicker accept="image/*" onSelect={handleAvatarFileSelect}>
            <Button icon="pencil" content={t('action.edit')} className={styles.avatarButton} />
          </FilePicker>
          {user.avatar && (
            <Button
              negative
              icon="trash alternate outline"
              content={t('action.delete')}
              className={styles.avatarButton}
              onClick={handleAvatarDeleteClick}
            />
          )}
        </div>
      </div>

      <Divider />

      {usernameMessage && (
        <Message
          {...{ [usernameMessage.type]: true }}
          visible
          content={t(usernameMessage.content)}
          onDismiss={handleDismissUsernameError}
        />
      )}
      {emailMessage && (
        <Message
          {...{ [emailMessage.type]: true }}
          visible
          content={t(emailMessage.content)}
          onDismiss={handleDismissEmailError}
        />
      )}
      {passwordMessage && (
        <Message
          {...{ [passwordMessage.type]: true }}
          visible
          content={t(passwordMessage.content)}
          onDismiss={handleDismissPasswordError}
        />
      )}

      <Form onSubmit={handleSubmit}>
        <div className={styles.twoColumns}>
          <div className={styles.column}>
            <div className={styles.fieldGroup}>
              <div className={styles.text}>{t('common.name')}</div>
              <Input
                fluid
                name="name"
                value={data.name}
                maxLength={128}
                disabled={!isNameEditable}
                onChange={handleFieldChange}
              />
            </div>
            {isUsernameEditable && (
              <div className={styles.fieldGroup}>
                <div className={styles.text}>{t('common.username')}</div>
                <div className={styles.lockedField}>
                  <Input
                    fluid
                    name="username"
                    value={data.username}
                    placeholder={user.username || ''}
                    maxLength={32}
                    disabled={!isUsernameUnlocked}
                    className={styles.lockedInput}
                    onChange={handleFieldChange}
                  />
                  {isUsernameUnlocked ? (
                    <button
                      type="button"
                      className={styles.unlockButton}
                      title={t('action.cancel')}
                      onClick={handleCancelUsername}
                    >
                      <Icon fitted name="close" size="small" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.unlockButton}
                      onClick={handleUnlockUsername}
                    >
                      <Icon fitted name="pencil" size="small" />
                    </button>
                  )}
                </div>
              </div>
            )}
            {isEmailEditable && (
              <div className={styles.fieldGroup}>
                <div className={styles.text}>{t('common.email')}</div>
                <div className={styles.lockedField}>
                  <Input
                    fluid
                    name="email"
                    value={data.email}
                    placeholder={user.email}
                    maxLength={256}
                    disabled={!isEmailUnlocked}
                    className={styles.lockedInput}
                    onChange={handleFieldChange}
                  />
                  {isEmailUnlocked ? (
                    <button
                      type="button"
                      className={styles.unlockButton}
                      title={t('action.cancel')}
                      onClick={handleCancelEmail}
                    >
                      <Icon fitted name="close" size="small" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.unlockButton}
                      onClick={handleUnlockEmail}
                    >
                      <Icon fitted name="pencil" size="small" />
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className={styles.fieldGroup}>
              <div className={styles.text}>{t('common.phone')}</div>
              <Input
                fluid
                name="phone"
                value={data.phone}
                maxLength={128}
                onChange={handleFieldChange}
              />
            </div>
          </div>
          <div className={styles.column}>
            <div className={styles.fieldGroup}>
              <div className={styles.text}>{t('common.organization')}</div>
              <Input
                fluid
                name="organization"
                value={data.organization}
                maxLength={128}
                onChange={handleFieldChange}
              />
            </div>
          </div>
        </div>

        <Divider />

        {!isPasswordVisible ? (
          <div className={styles.passwordToggleWrapper}>
            <Button
              type="button"
              icon="lock"
              content={t('action.changePassword')}
              onClick={handleTogglePassword}
            />
          </div>
        ) : (
          <div className={styles.passwordRow}>
            <div className={styles.passwordField}>
              <div className={styles.text}>{t('common.newPassword')}</div>
              <Input.Password
                withStrengthBar
                fluid
                name="newPassword"
                value={data.newPassword}
                maxLength={256}
                onChange={handleFieldChange}
              />
            </div>
            <div className={styles.passwordField}>
              <div className={styles.text}>{t('common.confirmPassword')}</div>
              <Input.Password
                fluid
                name="confirmPassword"
                value={data.confirmPassword}
                maxLength={256}
                onChange={handleFieldChange}
              />
            </div>
            <button
              type="button"
              className={styles.passwordCancelButton}
              title={t('action.cancel')}
              onClick={handleCancelPassword}
            >
              <Icon fitted name="close" size="small" />
            </button>
          </div>
        )}

        {withPasswordConfirmation && credentialsChanged && (
          <>
            <div className={styles.text}>{t('common.currentPassword')}</div>
            <Input.Password
              fluid
              name="currentPassword"
              value={currentPassword}
              maxLength={256}
              className={styles.field}
              onChange={handleCurrentPasswordChange}
            />
          </>
        )}

        <Button
          positive
          disabled={!anyChanged || isSubmitting}
          loading={isSubmitting}
          content={t('action.save')}
        />
      </Form>

      {!isCurrentUser && user.isTotpEnabled && (
        <>
          <Divider />
          <div className={styles.totpResetRow}>
            <div>
              <strong>{t('common.twoFactorAuthentication')}</strong>
              <p className={styles.totpResetHint}>{t('common.reset2faWarning')}</p>
            </div>
            <Button
              negative
              icon="shield alternate"
              content={t('action.reset2fa')}
              onClick={() => setIsTotpResetModalOpen(true)}
            />
          </div>
          {isTotpResetModalOpen && (
            <TotpAdminResetModal userId={userId} onClose={() => setIsTotpResetModalOpen(false)} />
          )}
        </>
      )}
    </Tab.Pane>
  );
});

ProfilePane.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default ProfilePane;
