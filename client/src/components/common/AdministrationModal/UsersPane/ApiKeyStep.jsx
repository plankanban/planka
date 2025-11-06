/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Input, Message } from 'semantic-ui-react';
import { Popup } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { useSteps } from '../../../../hooks';
import ConfirmationStep from '../../ConfirmationStep';

import styles from './ApiKeyStep.module.scss';

const StepTypes = {
  REGENERATE: 'REGENERATE',
  DELETE: 'DELETE',
};

const ApiKeyStep = React.memo(({ userId, onBack, onClose }) => {
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);

  const user = useSelector((state) => selectUserById(state, userId));

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateClick = useCallback(() => {
    if (user.apiKeyPrefix) {
      openStep(StepTypes.REGENERATE);
    } else {
      dispatch(entryActions.createUserApiKey(userId));
    }
  }, [userId, user.apiKeyPrefix, dispatch, openStep]);

  const handleRegenerateConfirm = useCallback(() => {
    dispatch(entryActions.createUserApiKey(userId));
    handleBack();
  }, [userId, dispatch, handleBack]);

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteUserApiKey(userId));
    onClose();
  }, [userId, onClose, dispatch]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  const handleCopyClick = useCallback(() => {
    if (isCopied) {
      return;
    }

    navigator.clipboard.writeText(user.apiKeyState.value);

    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  }, [user.apiKeyState.value, isCopied]);

  if (step) {
    switch (step.type) {
      case StepTypes.REGENERATE:
        return (
          <ConfirmationStep
            title="common.regenerateApiKey"
            content="common.areYouSureYouWantToRegenerateThisApiKey"
            buttonContent="action.regenerateApiKey"
            onConfirm={handleRegenerateConfirm}
            onBack={handleBack}
          />
        );
      case StepTypes.DELETE:
        return (
          <ConfirmationStep
            title="common.deleteApiKey"
            content="common.areYouSureYouWantToDeleteThisApiKey"
            buttonContent="action.deleteApiKey"
            onConfirm={handleDeleteConfirm}
            onBack={handleBack}
          />
        );
      default:
    }
  }

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.apiKey', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        {user.apiKeyPrefix ? (
          <>
            {!user.apiKeyState.isCreating &&
              (user.apiKeyState.value ? (
                <>
                  <Message
                    positive
                    header={t('common.apiKeyCreated', {
                      context: 'title',
                    })}
                    content={t('common.saveThisKeyItWillNotBeShownAgain')}
                  />
                  <div className={styles.valueWrapper}>
                    <Input fluid readOnly value={user.apiKeyState.value} className={styles.value} />
                    <Button className={styles.copyButton} onClick={handleCopyClick}>
                      <Icon fitted name={isCopied ? 'check' : 'copy'} />
                    </Button>
                  </div>
                </>
              ) : (
                <Message
                  warning
                  header={`${user.apiKeyPrefix}_...`}
                  content={t('common.fullKeyIsHiddenForSecurityReasons')}
                />
              ))}
            <Button
              fluid
              content={t('action.regenerateApiKey')}
              loading={user.apiKeyState.isCreating}
              disabled={user.apiKeyState.isCreating}
              className={styles.actionButton}
              onClick={handleGenerateClick}
            />
            <Button
              fluid
              content={t('action.deleteApiKey')}
              className={styles.actionButton}
              onClick={handleDeleteClick}
            />
          </>
        ) : (
          <>
            <div className={styles.content}>{t('common.noApiKeyCreated')}</div>
            <Button
              fluid
              positive
              content={t('action.createApiKey')}
              loading={user.apiKeyState.isCreating}
              disabled={user.apiKeyState.isCreating}
              onClick={handleGenerateClick}
            />
          </>
        )}
      </Popup.Content>
    </>
  );
});

ApiKeyStep.propTypes = {
  userId: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ApiKeyStep;
