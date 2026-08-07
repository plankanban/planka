/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Header, Icon, Message, Tab } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import TotpSetupWizard from './TotpSetupWizard';
import TotpDisableModal from './TotpDisableModal';
import TotpRecoveryCodesModal from './TotpRecoveryCodesModal';
import RecoveryCodesView from './RecoveryCodesView';
import TrustedDevicesSection from './TrustedDevicesSection';

import styles from './SecurityPane.module.scss';

const SecurityPane = React.memo(() => {
  const user = useSelector(selectors.selectCurrentUser);
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);

  const handleEnableClick = useCallback(() => {
    setIsWizardOpen(true);
  }, []);

  const handleWizardClose = useCallback(() => {
    setIsWizardOpen(false);
    dispatch(entryActions.clearCurrentUserTotpSetupValue());
  }, [dispatch]);

  const handleDisableClick = useCallback(() => {
    setIsDisableModalOpen(true);
  }, []);

  const handleDisableClose = useCallback(() => {
    setIsDisableModalOpen(false);
  }, []);

  const handleRegenerateClick = useCallback(() => {
    setIsRegenerateModalOpen(true);
  }, []);

  const handleRegenerateClose = useCallback(() => {
    setIsRegenerateModalOpen(false);
    dispatch(entryActions.clearCurrentUserTotpRecoveryCodes());
  }, [dispatch]);

  const totpState = user.totpState || {};
  const showRecoveryCodes = totpState.recoveryCodes && totpState.recoveryCodes.length > 0;

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Header as="h3">{t('common.twoFactorAuthentication')}</Header>

      {user.isTotpEnabled ? (
        <>
          <Message positive>
            <Icon name="shield" />
            <span>{t('common.twoFactor_enabled')}</span>
            {user.totpEnabledAt && (
              <span className={styles.enabledMeta}>
                {' — '}
                {t('common.enabledOn', {
                  date: new Date(user.totpEnabledAt).toLocaleString(),
                })}
              </span>
            )}
          </Message>
          {typeof user.totpRecoveryCodesRemaining === 'number' &&
            user.totpRecoveryCodesRemaining <= 3 && (
              <Message warning>
                <Icon name="warning sign" />
                {user.totpRecoveryCodesRemaining === 0
                  ? t('common.recoveryCodesExhausted')
                  : t('common.recoveryCodesLow', { count: user.totpRecoveryCodesRemaining })}
              </Message>
            )}
          <div className={styles.actionRow}>
            <Button
              basic
              icon="refresh"
              content={t('action.regenerateRecoveryCodes')}
              onClick={handleRegenerateClick}
            />
            <Button
              negative
              icon="shield alternate"
              content={t('action.disable2fa')}
              onClick={handleDisableClick}
            />
          </div>
          {showRecoveryCodes && (
            <RecoveryCodesView codes={totpState.recoveryCodes} className={styles.recoverySection} />
          )}
          <TrustedDevicesSection />
        </>
      ) : (
        <>
          <p className={styles.intro}>{t('common.twoFactor_intro')}</p>
          <Button
            primary
            icon="shield"
            content={t('action.enable2fa')}
            onClick={handleEnableClick}
          />
        </>
      )}

      {isWizardOpen && <TotpSetupWizard onClose={handleWizardClose} />}
      {isDisableModalOpen && <TotpDisableModal onClose={handleDisableClose} />}
      {isRegenerateModalOpen && <TotpRecoveryCodesModal onClose={handleRegenerateClose} />}
    </Tab.Pane>
  );
});

export default SecurityPane;
