/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form, Message, Modal } from 'semantic-ui-react';
import { Input } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import RecoveryCodesView from './RecoveryCodesView';

const TotpRecoveryCodesModal = React.memo(({ onClose }) => {
  const user = useSelector(selectors.selectCurrentUser);
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const totpState = user.totpState || {};
  const { isRegeneratingRecoveryCodes, error, recoveryCodes } = totpState;

  const handleSubmit = useCallback(() => {
    if (!password || !code) return;
    dispatch(
      entryActions.regenerateCurrentUserTotpRecoveryCodes({
        currentPassword: password,
        code: code.replace(/\s+/g, ''),
      }),
    );
  }, [dispatch, password, code]);

  const hasCodes = recoveryCodes && recoveryCodes.length > 0;

  return (
    <Modal open centered size="small" closeOnDimmerClick={false} onClose={onClose}>
      <Modal.Header>{t('common.regenerateRecoveryCodes_title')}</Modal.Header>
      <Modal.Content>
        {!hasCodes && (
          <>
            <p>{t('common.regenerateRecoveryCodesIntro')}</p>
            {error && error.message === 'Invalid current password' && (
              <Message error content={t('common.invalidCurrentPassword')} />
            )}
            {error && error.message === 'Invalid TOTP code' && (
              <Message error content={t('common.invalidTotpCode')} />
            )}
            <Form onSubmit={handleSubmit}>
              <Form.Field>
                <label htmlFor="totp-regen-password">{t('common.currentPassword')}</label>
                <Input.Password
                  fluid
                  id="totp-regen-password"
                  value={password}
                  maxLength={256}
                  onChange={(_, { value }) => setPassword(value)}
                />
              </Form.Field>
              <Form.Field>
                <label htmlFor="totp-regen-code">{t('common.totpCode')}</label>
                <Input
                  fluid
                  id="totp-regen-code"
                  value={code}
                  maxLength={8}
                  placeholder="000000"
                  autoComplete="one-time-code"
                  onChange={(_, { value }) => setCode(value)}
                />
              </Form.Field>
            </Form>
          </>
        )}

        {hasCodes && (
          <>
            <Message warning>
              <Message.Header>{t('common.saveTheseCodes_title')}</Message.Header>
              <p>{t('common.recoveryCodesIntro')}</p>
            </Message>
            <RecoveryCodesView codes={recoveryCodes} />
          </>
        )}
      </Modal.Content>
      <Modal.Actions>
        {!hasCodes ? (
          <>
            <Button content={t('action.cancel')} floated="left" onClick={onClose} />
            <Button
              positive
              content={t('action.regenerate')}
              loading={isRegeneratingRecoveryCodes}
              disabled={isRegeneratingRecoveryCodes || !password || !code}
              onClick={handleSubmit}
            />
          </>
        ) : (
          <Button positive content={t('action.done')} onClick={onClose} />
        )}
      </Modal.Actions>
    </Modal>
  );
});

TotpRecoveryCodesModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default TotpRecoveryCodesModal;
