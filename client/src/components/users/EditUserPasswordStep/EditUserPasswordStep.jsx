/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import omit from 'lodash/omit';
import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form, Message } from 'semantic-ui-react';
import { useDidUpdate, usePrevious, useToggle } from '../../../lib/hooks';
import { Input, Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, useNestedRef } from '../../../hooks';
import { isPassword } from '../../../utils/validator';

import styles from './EditUserPasswordStep.module.scss';

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

const EditUserPasswordStep = React.memo(({ id, onBack, onClose }) => {
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);

  const {
    isSsoUser,
    passwordUpdateForm: { data: defaultData, isSubmitting, error },
  } = useSelector((state) => selectUserById(state, id));

  const withPasswordConfirmation = useSelector(
    (state) => id === selectors.selectCurrentUserId(state) && !isSsoUser,
  );

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const wasSubmitting = usePrevious(isSubmitting);

  const [data, handleFieldChange, setData] = useForm({
    password: '',
    currentPassword: '',
    ...defaultData,
  });

  const message = useMemo(() => createMessage(error), [error]);
  const [focusCurrentPasswordFieldState, focusCurrentPasswordField] = useToggle();

  const [passwordFieldRef, handlePasswordFieldRef] = useNestedRef('inputRef');
  const [currentPasswordFieldRef, handleCurrentPasswordFieldRef] = useNestedRef('inputRef');

  const handleSubmit = useCallback(() => {
    if (!data.password || !isPassword(data.password)) {
      passwordFieldRef.current.select();
      return;
    }

    if (withPasswordConfirmation && !data.currentPassword) {
      currentPasswordFieldRef.current.focus();
      return;
    }

    dispatch(
      entryActions.updateUserPassword(
        id,
        withPasswordConfirmation ? data : omit(data, 'currentPassword'),
      ),
    );
  }, [id, withPasswordConfirmation, dispatch, data, passwordFieldRef, currentPasswordFieldRef]);

  const handleMessageDismiss = useCallback(() => {
    dispatch(entryActions.clearUserPasswordUpdateError(id));
  }, [id, dispatch]);

  useEffect(() => {
    passwordFieldRef.current.focus({
      preventScroll: true,
    });
  }, [passwordFieldRef]);

  useDidUpdate(() => {
    if (wasSubmitting && !isSubmitting) {
      if (!error) {
        onClose();
      } else if (error.message === 'Invalid current password') {
        setData((prevData) => ({
          ...prevData,
          currentPassword: '',
        }));
        focusCurrentPasswordField();
      }
    }
  }, [isSubmitting, wasSubmitting, error, onClose]);

  useDidUpdate(() => {
    currentPasswordFieldRef.current.focus();
  }, [focusCurrentPasswordFieldState]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.editPassword', {
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
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.newPassword')}</div>
          <Input.Password
            withStrengthBar
            fluid
            ref={handlePasswordFieldRef}
            name="password"
            value={data.password}
            maxLength={256}
            className={styles.field}
            onChange={handleFieldChange}
          />
          {withPasswordConfirmation && (
            <>
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
            </>
          )}
          <Button
            positive
            content={t('action.save')}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </Form>
      </Popup.Content>
    </>
  );
});

EditUserPasswordStep.propTypes = {
  id: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

EditUserPasswordStep.defaultProps = {
  onBack: undefined,
};

export default EditUserPasswordStep;
