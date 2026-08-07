/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Checkbox, Form, Message, Modal } from 'semantic-ui-react';
import { Input } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import RecoveryCodesView from './RecoveryCodesView';

import styles from './TotpSetupWizard.module.scss';

const STEPS = {
  PASSWORD: 'password',
  SCAN: 'scan',
  VERIFY: 'verify',
  CODES: 'codes',
};

const TotpSetupWizard = React.memo(({ onClose }) => {
  const user = useSelector(selectors.selectCurrentUser);
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [step, setStep] = useState(STEPS.PASSWORD);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [savedConfirmed, setSavedConfirmed] = useState(false);

  const totpState = user.totpState || {};
  const { setupSecret, setupProvisioningUri, isSettingUp, isEnabling, recoveryCodes, error } =
    totpState;

  useEffect(() => {
    if (step === STEPS.SCAN && setupSecret && setupProvisioningUri) {
      // Already initialized
    }
  }, [step, setupSecret, setupProvisioningUri]);

  // Once setup succeeds, advance to scan
  useEffect(() => {
    if (step === STEPS.PASSWORD && setupSecret && setupProvisioningUri) {
      setStep(STEPS.SCAN);
    }
  }, [step, setupSecret, setupProvisioningUri]);

  // Once enable succeeds (recovery codes appear), advance to codes screen
  useEffect(() => {
    if (recoveryCodes && recoveryCodes.length > 0 && step === STEPS.VERIFY) {
      setStep(STEPS.CODES);
    }
  }, [recoveryCodes, step]);

  const handlePasswordSubmit = useCallback(() => {
    if (!password) return;
    dispatch(entryActions.setupCurrentUserTotp({ currentPassword: password }));
  }, [dispatch, password]);

  const handleProceedToVerify = useCallback(() => {
    setStep(STEPS.VERIFY);
  }, []);

  const handleVerifySubmit = useCallback(() => {
    const trimmed = code.replace(/\s+/g, '');
    if (!trimmed) return;
    dispatch(
      entryActions.enableCurrentUserTotp({
        currentPassword: password,
        code: trimmed,
      }),
    );
  }, [dispatch, code, password]);

  const handleBackToScan = useCallback(() => {
    setCode('');
    setStep(STEPS.SCAN);
  }, []);

  const handleDone = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal open centered size="small" closeOnDimmerClick={false} onClose={handleCancel}>
      <Modal.Header>{t('common.enable2fa_title')}</Modal.Header>
      <Modal.Content>
        {step === STEPS.PASSWORD && (
          <Form onSubmit={handlePasswordSubmit}>
            <p className={styles.intro}>{t('common.enterPasswordToContinue')}</p>
            {error && error.message === 'Invalid current password' && (
              <Message error content={t('common.invalidCurrentPassword')} />
            )}
            <Form.Field>
              <label htmlFor="totp-current-password">{t('common.currentPassword')}</label>
              <Input.Password
                fluid
                id="totp-current-password"
                value={password}
                maxLength={256}
                onChange={(_, { value }) => setPassword(value)}
              />
            </Form.Field>
          </Form>
        )}

        {step === STEPS.SCAN && setupProvisioningUri && (
          <div className={styles.scanStep}>
            <p>{t('common.scanQrCodeWithApp')}</p>
            <div className={styles.qrWrapper}>
              <QRCodeSVG value={setupProvisioningUri} size={200} level="M" />
            </div>
            <p className={styles.secretLabel}>{t('common.orEnterSecretManually')}</p>
            <code className={styles.secret}>{setupSecret}</code>
          </div>
        )}

        {step === STEPS.VERIFY && (
          <Form onSubmit={handleVerifySubmit}>
            <p>{t('common.enterCodeFromApp')}</p>
            {error && error.message === 'Invalid TOTP code' && (
              <Message error content={t('common.invalidTotpCode')} />
            )}
            <Form.Field>
              <Input
                fluid
                autoFocus
                value={code}
                maxLength={8}
                placeholder="000000"
                autoComplete="one-time-code"
                className={styles.codeInput}
                onChange={(_, { value }) => setCode(value)}
              />
            </Form.Field>
          </Form>
        )}

        {step === STEPS.CODES && recoveryCodes && (
          <div className={styles.codesStep}>
            <Message warning>
              <Message.Header>{t('common.saveTheseCodes_title')}</Message.Header>
              <p>{t('common.recoveryCodesIntro')}</p>
            </Message>
            <RecoveryCodesView codes={recoveryCodes} />
            <Checkbox
              label={t('common.confirmCodesSaved')}
              checked={savedConfirmed}
              className={styles.savedCheckbox}
              onChange={(_, { checked }) => setSavedConfirmed(checked)}
            />
          </div>
        )}
      </Modal.Content>
      <Modal.Actions>
        {step !== STEPS.CODES && (
          <Button content={t('action.cancel')} floated="left" onClick={handleCancel} />
        )}
        {step === STEPS.PASSWORD && (
          <Button
            positive
            content={t('action.continue')}
            loading={isSettingUp}
            disabled={isSettingUp || !password}
            onClick={handlePasswordSubmit}
          />
        )}
        {step === STEPS.SCAN && (
          <Button positive content={t('action.continue')} onClick={handleProceedToVerify} />
        )}
        {step === STEPS.VERIFY && (
          <>
            <Button content={t('action.back')} onClick={handleBackToScan} />
            <Button
              positive
              content={t('action.verify')}
              loading={isEnabling}
              disabled={isEnabling || !code}
              onClick={handleVerifySubmit}
            />
          </>
        )}
        {step === STEPS.CODES && (
          <Button
            positive
            content={t('action.done')}
            disabled={!savedConfirmed}
            onClick={handleDone}
          />
        )}
      </Modal.Actions>
    </Modal>
  );
});

TotpSetupWizard.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default TotpSetupWizard;
