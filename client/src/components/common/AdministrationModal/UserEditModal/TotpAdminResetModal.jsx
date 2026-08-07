/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form, Message, Modal } from 'semantic-ui-react';
import { Input } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';

const TotpAdminResetModal = React.memo(({ userId, onClose }) => {
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);
  const user = useSelector((state) => selectUserById(state, userId));

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [password, setPassword] = useState('');
  const wasDisablingRef = useRef(false);

  const totpState = user.totpState || {};
  const { isDisabling, error } = totpState;

  useEffect(() => {
    if (wasDisablingRef.current && !isDisabling && !error) {
      onClose();
    }
    wasDisablingRef.current = isDisabling;
  }, [isDisabling, error, onClose]);

  const handleSubmit = useCallback(() => {
    if (!password) return;
    dispatch(entryActions.disableUserTotp(userId, { currentPassword: password }));
  }, [dispatch, userId, password]);

  return (
    <Modal open centered size="tiny" closeOnDimmerClick={false} onClose={onClose}>
      <Modal.Header>{t('common.reset2fa_title')}</Modal.Header>
      <Modal.Content>
        <p>{t('common.reset2faWarning')}</p>
        {error && error.message === 'Invalid current password' && (
          <Message error content={t('common.invalidCurrentPassword')} />
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Field>
            <label htmlFor="totp-admin-reset-password">{t('common.currentPassword')}</label>
            <Input.Password
              fluid
              id="totp-admin-reset-password"
              value={password}
              maxLength={256}
              autoFocus
              onChange={(_, { value }) => setPassword(value)}
            />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button content={t('action.cancel')} floated="left" onClick={onClose} />
        <Button
          negative
          icon="shield alternate"
          content={t('action.reset2fa')}
          loading={isDisabling}
          disabled={isDisabling || !password}
          onClick={handleSubmit}
        />
      </Modal.Actions>
    </Modal>
  );
});

TotpAdminResetModal.propTypes = {
  userId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TotpAdminResetModal;
