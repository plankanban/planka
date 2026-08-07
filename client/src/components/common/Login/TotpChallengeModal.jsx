/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Form, Message, Modal } from 'semantic-ui-react';
import { Input } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useNestedRef } from '../../../hooks';

import styles from './TotpChallengeModal.module.scss';

const sanitizeCode = (value) => value.replace(/\s+/g, '').toLowerCase();

const createMessage = (error) => {
  if (!error) return null;
  if (error.message === 'Invalid TOTP code') {
    return { type: 'error', content: 'common.invalidTotpCode' };
  }
  if (error.message === 'Invalid pending token') {
    return { type: 'error', content: 'common.totpSessionExpired' };
  }
  return { type: 'warning', content: 'common.unknownError' };
};

const TotpChallengeModal = React.memo(() => {
  const {
    totpForm: { isSubmitting, isCancelling, error },
  } = useSelector(selectors.selectAuthenticateForm);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [code, setCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const [codeFieldRef, handleCodeFieldRef] = useNestedRef('inputRef');

  const message = useMemo(() => createMessage(error), [error]);

  const handleSubmit = useCallback(() => {
    const trimmed = sanitizeCode(code);
    if (!trimmed) {
      if (codeFieldRef.current) codeFieldRef.current.focus();
      return;
    }
    dispatch(entryActions.verifyTotp({ code: trimmed, trustDevice }));
  }, [dispatch, code, trustDevice, codeFieldRef]);

  const handleCancelClick = useCallback(() => {
    dispatch(entryActions.cancelTotpChallenge());
  }, [dispatch]);

  const handleCodeChange = useCallback((_, { value }) => {
    setCode(value);
  }, []);

  const handleTrustDeviceChange = useCallback((_, { checked }) => {
    setTrustDevice(checked);
  }, []);

  return (
    <Modal open centered size="tiny" closeOnDimmerClick={false} closeOnEscape={false}>
      <Modal.Header>{t('common.twoFactorRequired_title')}</Modal.Header>
      <Modal.Content>
        <p className={styles.intro}>{t('common.enterTotpOrRecoveryCode')}</p>
        {message && (
          <Message
            {...{
              [message.type]: true,
            }}
            content={t(message.content)}
          />
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Field>
            <Input
              fluid
              autoFocus
              ref={handleCodeFieldRef}
              value={code}
              maxLength={16}
              placeholder="000000 / xxxxx-xxxxx"
              autoComplete="one-time-code"
              readOnly={isSubmitting}
              className={styles.codeInput}
              onChange={handleCodeChange}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              label={t('common.trustThisBrowser')}
              checked={trustDevice}
              disabled={isSubmitting || isCancelling}
              onChange={handleTrustDeviceChange}
            />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button
          content={t('action.cancelAndClose')}
          floated="left"
          loading={isCancelling}
          disabled={isSubmitting || isCancelling}
          onClick={handleCancelClick}
        />
        <Button
          positive
          content={t('action.verify')}
          loading={isSubmitting}
          disabled={isSubmitting || isCancelling || !code}
          onClick={handleSubmit}
        />
      </Modal.Actions>
    </Modal>
  );
});

export default TotpChallengeModal;
