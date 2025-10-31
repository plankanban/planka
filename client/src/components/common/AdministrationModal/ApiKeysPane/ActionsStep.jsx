/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon, Menu, Message } from 'semantic-ui-react';
import { Popup } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { useSteps } from '../../../../hooks';
import ActionTypes from '../../../../constants/ActionTypes';
import ConfirmationStep from '../../ConfirmationStep';
import ApiKeyDisplayStep from './ApiKeyDisplayStep';

import styles from './ActionsStep.module.scss';

const createMessage = (error) => {
  if (!error) {
    return error;
  }

  switch (error.message) {
    case 'User does not have an API key':
      return {
        type: 'error',
        content: 'common.userDoesNotHaveApiKey',
      };
    case 'API key already exists':
      return {
        type: 'error',
        content: 'common.apiKeyAlreadyExists',
      };
    case 'User not found':
      return {
        type: 'error',
        content: 'common.userNotFound',
      };
    default:
      return {
        type: 'warning',
        content: 'common.unknownError',
      };
  }
};

const StepTypes = {
  CREATE: 'CREATE',
  CYCLE: 'CYCLE',
  REMOVE: 'REMOVE',
  DISPLAY_KEY: 'DISPLAY_KEY',
};

const ActionsStep = React.memo(({ userId, onClose }) => {
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);

  const user = useSelector((state) => selectUserById(state, userId));
  const [apiKey, setApiKey] = useState(null);
  const [error, setError] = useState(null);
  const [dismissedError, setDismissedError] = useState(false);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  // Listen for success/failure actions via actions reducer
  const lastAction = useSelector((state) => state.actions?.lastAction);
  const processedActionRef = useRef(null);

  useEffect(() => {
    if (!lastAction || lastAction === processedActionRef.current) {
      return;
    }

    // Handle success actions
    if (
      (lastAction.type === ActionTypes.API_KEY_CREATE__SUCCESS ||
        lastAction.type === ActionTypes.API_KEY_CYCLE__SUCCESS) &&
      lastAction.payload?.userId === userId &&
      lastAction.payload?.apiKey
    ) {
      processedActionRef.current = lastAction;
      setApiKey(lastAction.payload.apiKey);
      setError(null);
      setDismissedError(false);
      openStep(StepTypes.DISPLAY_KEY);
    }

    // Handle failure actions
    if (
      (lastAction.type === ActionTypes.API_KEY_CREATE__FAILURE ||
        lastAction.type === ActionTypes.API_KEY_CYCLE__FAILURE ||
        lastAction.type === ActionTypes.API_KEY_DELETE__FAILURE) &&
      lastAction.payload?.userId === userId
    ) {
      processedActionRef.current = lastAction;
      setError(lastAction.payload.error);
      setDismissedError(false);
      handleBack();
    }

    // Clear when modal closes
    if (lastAction.type === ActionTypes.MODAL_CLOSE) {
      processedActionRef.current = lastAction;
      setApiKey(null);
      setError(null);
      setDismissedError(false);
    }
  }, [lastAction, userId, openStep, handleBack]);

  const message = useMemo(() => {
    if (!error || dismissedError) {
      return null;
    }
    return createMessage(error);
  }, [error, dismissedError]);

  const handleMessageDismiss = useCallback(() => {
    setDismissedError(true);
  }, []);

  const hasApiKey = user.apiKeyPrefix !== null && user.apiKeyPrefix !== undefined;

  const handleCreateConfirm = useCallback(() => {
    setDismissedError(false);
    dispatch(entryActions.createApiKey(userId));
    handleBack(); // Go back to main menu, then DISPLAY_KEY step will show when API key arrives
  }, [userId, dispatch, handleBack]);

  const handleCycleConfirm = useCallback(() => {
    setDismissedError(false);
    dispatch(entryActions.cycleApiKey(userId));
    handleBack(); // Go back to main menu, then DISPLAY_KEY step will show when API key arrives
  }, [userId, dispatch, handleBack]);

  const handleRemoveConfirm = useCallback(() => {
    setDismissedError(false);
    dispatch(entryActions.deleteApiKey(userId));
    onClose(); // Close after remove since no key to display
  }, [userId, onClose, dispatch]);

  const handleCreateClick = useCallback(() => {
    openStep(StepTypes.CREATE);
  }, [openStep]);

  const handleCycleClick = useCallback(() => {
    openStep(StepTypes.CYCLE);
  }, [openStep]);

  const handleRemoveClick = useCallback(() => {
    openStep(StepTypes.REMOVE);
  }, [openStep]);

  if (step) {
    switch (step.type) {
      case StepTypes.CREATE:
        return (
          <ConfirmationStep
            title="common.createApiKey"
            content="common.areYouSureYouWantToCreateApiKey"
            buttonType="positive"
            buttonContent="action.createApiKey"
            onConfirm={handleCreateConfirm}
            onBack={handleBack}
          />
        );
      case StepTypes.CYCLE:
        return (
          <ConfirmationStep
            title="common.cycleApiKey"
            content="common.areYouSureYouWantToCycleApiKey"
            buttonContent="action.cycleApiKey"
            onConfirm={handleCycleConfirm}
            onBack={handleBack}
          />
        );
      case StepTypes.REMOVE:
        return (
          <ConfirmationStep
            title="common.removeApiKey"
            content="common.areYouSureYouWantToRemoveApiKey"
            buttonContent="action.removeApiKey"
            onConfirm={handleRemoveConfirm}
            onBack={handleBack}
          />
        );
      case StepTypes.DISPLAY_KEY:
        return <ApiKeyDisplayStep apiKey={apiKey} onBack={handleBack} onClose={onClose} />;
      default:
    }
  }

  return (
    <>
      <Popup.Header>
        {t('common.apiKeyActions', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        {message && (
          <Message
            {...{
              [message.type]: true,
            }}
            visible
            content={t(message.content)}
            onDismiss={handleMessageDismiss}
          />
        )}
        <Menu secondary vertical className={styles.menu}>
          {!hasApiKey && (
            <Menu.Item className={styles.menuItem} onClick={handleCreateClick}>
              <Icon name="plus" className={styles.menuItemIcon} />
              {t('action.createApiKey', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          {hasApiKey && (
            <>
              <Menu.Item className={styles.menuItem} onClick={handleCycleClick}>
                <Icon name="refresh" className={styles.menuItemIcon} />
                {t('action.cycleApiKey', {
                  context: 'title',
                })}
              </Menu.Item>
              <Menu.Item className={styles.menuItem} onClick={handleRemoveClick}>
                <Icon name="trash alternate outline" className={styles.menuItemIcon} />
                {t('action.removeApiKey', {
                  context: 'title',
                })}
              </Menu.Item>
            </>
          )}
        </Menu>
      </Popup.Content>
    </>
  );
});

ActionsStep.propTypes = {
  userId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ActionsStep;
