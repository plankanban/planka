/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import isEmail from 'validator/lib/isEmail';
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

import styles from './EditUserEmailStep.module.scss';

const createMessage = (error) => {
  if (!error) {
    return error;
  }

  switch (error.message) {
    case 'Email already in use':
      return {
        type: 'error',
        content: 'common.emailAlreadyInUse',
      };
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

const EditUserEmailStep = React.memo(({ id, onBack, onClose }) => {
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);

  const {
    email,
    isSsoUser,
    emailUpdateForm: { data: defaultData, isSubmitting, error },
  } = useSelector((state) => selectUserById(state, id));

  const withPasswordConfirmation = useSelector(
    (state) => id === selectors.selectCurrentUserId(state) && !isSsoUser,
  );

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const wasSubmitting = usePrevious(isSubmitting);

  const [data, handleFieldChange, setData] = useForm({
    email: '',
    currentPassword: '',
    ...defaultData,
  });

  const message = useMemo(() => createMessage(error), [error]);
  const [focusCurrentPasswordFieldState, focusCurrentPasswordField] = useToggle();

  const [emailFieldRef, handleEmailFieldRef] = useNestedRef('inputRef');
  const [currentPasswordFieldRef, handleCurrentPasswordFieldRef] = useNestedRef('inputRef');

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      email: data.email.trim(),
    };

    if (!isEmail(cleanData.email)) {
      emailFieldRef.current.select();
      return;
    }

    if (cleanData.email === email) {
      onClose();
      return;
    }

    if (withPasswordConfirmation) {
      if (!cleanData.currentPassword) {
        currentPasswordFieldRef.current.focus();
        return;
      }
    } else {
      delete cleanData.currentPassword;
    }

    dispatch(entryActions.updateUserEmail(id, cleanData));
  }, [
    id,
    withPasswordConfirmation,
    onClose,
    email,
    dispatch,
    data,
    emailFieldRef,
    currentPasswordFieldRef,
  ]);

  const handleMessageDismiss = useCallback(() => {
    dispatch(entryActions.clearUserEmailUpdateError(id));
  }, [id, dispatch]);

  useEffect(() => {
    emailFieldRef.current.focus({
      preventScroll: true,
    });
  }, [emailFieldRef]);

  useDidUpdate(() => {
    if (wasSubmitting && !isSubmitting) {
      if (error) {
        switch (error.message) {
          case 'Email already in use':
            emailFieldRef.current.select();

            break;
          case 'Invalid current password':
            setData((prevData) => ({
              ...prevData,
              currentPassword: '',
            }));
            focusCurrentPasswordField();

            break;
          default:
        }
      } else {
        onClose();
      }
    }
  }, [isSubmitting, wasSubmitting, error, onClose]);

  useDidUpdate(() => {
    currentPasswordFieldRef.current.focus();
  }, [focusCurrentPasswordFieldState]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.editEmail', {
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
          <div className={styles.text}>{t('common.newEmail')}</div>
          <Input
            fluid
            ref={handleEmailFieldRef}
            name="email"
            value={data.email}
            placeholder={email}
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

EditUserEmailStep.propTypes = {
  id: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

EditUserEmailStep.defaultProps = {
  onBack: undefined,
};

export default EditUserEmailStep;
