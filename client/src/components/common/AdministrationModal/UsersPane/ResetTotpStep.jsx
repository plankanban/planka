/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form, Message } from 'semantic-ui-react';
import { Input, Popup } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { useForm, useNestedRef } from '../../../../hooks';

import styles from './ResetTotpStep.module.scss';

const createMessage = (error) => {
  if (!error) {
    return error;
  }

  switch (error.message) {
    case 'Invalid current password':
      return {
        type: 'error',
        content: 'common.invalidCurrentPassword',
      };
    default:
      return {
        type: 'warning',
        content: 'common.unknownError',
      };
  }
};

const ResetTotpStep = React.memo(({ userId, onBack, onClose }) => {
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);
  const user = useSelector((state) => selectUserById(state, userId));

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const { isDisabling, error } = user.totpState || {};
  const wasDisablingRef = useRef(false);

  const [data, handleFieldChange] = useForm({
    currentPassword: '',
  });

  const [currentPasswordFieldRef, handleCurrentPasswordFieldRef] = useNestedRef('inputRef');

  const message = useMemo(() => createMessage(error), [error]);

  // The admin confirms with their own password, so the only signal that the
  // reset went through is the request finishing without an error.
  useEffect(() => {
    if (wasDisablingRef.current && !isDisabling && !error) {
      onClose();
    }

    wasDisablingRef.current = isDisabling;
  }, [isDisabling, error, onClose]);

  const handleSubmit = useCallback(() => {
    if (!data.currentPassword) {
      currentPasswordFieldRef.current.focus();
      return;
    }

    dispatch(
      entryActions.disableUserTotp(userId, {
        currentPassword: data.currentPassword,
      }),
    );
  }, [dispatch, userId, data.currentPassword, currentPasswordFieldRef]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.reset2fa', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <p className={styles.warning}>{t('common.reset2faWarning')}</p>
        {message && (
          <Message
            {...{
              [message.type]: true,
            }}
            visible
            content={t(message.content)}
          />
        )}
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.currentPassword')}</div>
          <Input.Password
            fluid
            ref={handleCurrentPasswordFieldRef}
            name="currentPassword"
            value={data.currentPassword}
            maxLength={256}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <Button
            negative
            content={t('action.reset2fa')}
            icon="shield alternate"
            loading={isDisabling}
            disabled={isDisabling}
          />
        </Form>
      </Popup.Content>
    </>
  );
});

ResetTotpStep.propTypes = {
  userId: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ResetTotpStep.defaultProps = {
  onBack: undefined,
};

export default ResetTotpStep;
