/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form, Message, Modal } from 'semantic-ui-react';
import { Input } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';

const TotpDisableModal = React.memo(({ onClose }) => {
  const user = useSelector(selectors.selectCurrentUser);
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const totpState = user.totpState || {};
  const { isDisabling, error } = totpState;
  const wasDisablingRef = useRef(false);

  useEffect(() => {
    if (wasDisablingRef.current && !isDisabling && !error && !user.isTotpEnabled) {
      onClose();
    }
    wasDisablingRef.current = isDisabling;
  }, [isDisabling, error, user.isTotpEnabled, onClose]);

  const handleSubmit = useCallback(() => {
    if (!password || !code) return;
    dispatch(
      entryActions.disableCurrentUserTotp({
        currentPassword: password,
        code: code.replace(/\s+/g, ''),
      }),
    );
  }, [dispatch, password, code]);

  return (
    <Modal open centered size="tiny" closeOnDimmerClick={false} onClose={onClose}>
      <Modal.Header>{t('common.disable2fa_title')}</Modal.Header>
      <Modal.Content>
        <p>{t('common.disable2faWarning')}</p>
        {error && error.message === 'Invalid current password' && (
          <Message error content={t('common.invalidCurrentPassword')} />
        )}
        {error && error.message === 'Invalid TOTP code' && (
          <Message error content={t('common.invalidTotpCode')} />
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Field>
            <label htmlFor="totp-disable-password">{t('common.currentPassword')}</label>
            <Input.Password
              fluid
              id="totp-disable-password"
              value={password}
              maxLength={256}
              onChange={(_, { value }) => setPassword(value)}
            />
          </Form.Field>
          <Form.Field>
            <label htmlFor="totp-disable-code">{t('common.totpOrRecoveryCode')}</label>
            <Input
              fluid
              id="totp-disable-code"
              value={code}
              maxLength={16}
              placeholder="000000 / xxxxx-xxxxx"
              autoComplete="one-time-code"
              onChange={(_, { value }) => setCode(value)}
            />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button content={t('action.cancel')} floated="left" onClick={onClose} />
        <Button
          negative
          content={t('action.disable2fa')}
          loading={isDisabling}
          disabled={isDisabling || !password || !code}
          onClick={handleSubmit}
        />
      </Modal.Actions>
    </Modal>
  );
});

TotpDisableModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default TotpDisableModal;
