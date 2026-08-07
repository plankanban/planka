/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';

const AutoLogoutWarningModal = React.memo(() => {
  const warning = useSelector(selectors.selectAutoLogoutWarning);
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const computeRemaining = useCallback(
    () => (warning ? Math.max(0, Math.ceil((warning.expiresAt - Date.now()) / 1000)) : 0),
    [warning],
  );

  const [remainingSeconds, setRemainingSeconds] = useState(computeRemaining);

  useEffect(() => {
    if (!warning) {
      return undefined;
    }

    setRemainingSeconds(computeRemaining());

    const interval = setInterval(() => {
      setRemainingSeconds(computeRemaining());
    }, 500);

    return () => clearInterval(interval);
  }, [warning, computeRemaining]);

  const handleStayClick = useCallback(() => {
    dispatch(entryActions.dismissAutoLogoutWarning());
  }, [dispatch]);

  const handleLogoutClick = useCallback(() => {
    dispatch(entryActions.logout());
  }, [dispatch]);

  if (!warning) {
    return null;
  }

  return (
    <Modal open size="tiny" centered closeOnDimmerClick={false} closeOnEscape={false}>
      <Modal.Header>{t('common.autoLogoutWarning_title')}</Modal.Header>
      <Modal.Content>
        <p>{t('common.autoLogoutWarning_body', { seconds: remainingSeconds })}</p>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={handleLogoutClick}>{t('action.logOutNow')}</Button>
        <Button
          positive
          content={t('action.stayLoggedIn')}
          icon="checkmark"
          onClick={handleStayClick}
        />
      </Modal.Actions>
    </Modal>
  );
});

export default AutoLogoutWarningModal;
