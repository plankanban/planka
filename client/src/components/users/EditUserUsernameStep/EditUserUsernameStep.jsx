/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

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
import { isUsername } from '../../../utils/validator';

import styles from './EditUserUsernameStep.module.scss';

const createMessage = (error) => {
  if (!error) {
    return error;
  }

  switch (error.message) {
    case 'Username already in use':
      return {
        type: 'error',
        content: 'common.usernameAlreadyInUse',
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

const EditUserUsernameStep = React.memo(({ id, onBack, onClose }) => {
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);

  const {
    username,
    isSsoUser,
    usernameUpdateForm: { data: defaultData, isSubmitting, error },
  } = useSelector((state) => selectUserById(state, id));

  const withPasswordConfirmation = useSelector(
    (state) => id === selectors.selectCurrentUserId(state) && !isSsoUser,
  );

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const wasSubmitting = usePrevious(isSubmitting);

  const [data, handleFieldChange, setData] = useForm({
    username: '',
    currentPassword: '',
    ...defaultData,
  });

  const message = useMemo(() => createMessage(error), [error]);
  const [focusCurrentPasswordFieldState, focusCurrentPasswordField] = useToggle();

  const [usernameFieldRef, handleUsernameFieldRef] = useNestedRef('inputRef');
  const [currentPasswordFieldRef, handleCurrentPasswordFieldRef] = useNestedRef('inputRef');

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      username: data.username.trim() || null,
    };

    if (!cleanData.username || !isUsername(cleanData.username)) {
      usernameFieldRef.current.select();
      return;
    }

    if (cleanData.username === username) {
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

    dispatch(entryActions.updateUserUsername(id, cleanData));
  }, [
    id,
    withPasswordConfirmation,
    onClose,
    username,
    dispatch,
    data,
    usernameFieldRef,
    currentPasswordFieldRef,
  ]);

  const handleMessageDismiss = useCallback(() => {
    dispatch(entryActions.clearUserUsernameUpdateError(id));
  }, [id, dispatch]);

  useEffect(() => {
    usernameFieldRef.current.focus({
      preventScroll: true,
    });
  }, [usernameFieldRef]);

  useDidUpdate(() => {
    if (wasSubmitting && !isSubmitting) {
      if (error) {
        switch (error.message) {
          case 'Username already in use':
            usernameFieldRef.current.select();

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
        {t('common.editUsername', {
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
          <div className={styles.text}>{t('common.newUsername')}</div>
          <Input
            fluid
            ref={handleUsernameFieldRef}
            name="username"
            value={data.username}
            placeholder={username}
            maxLength={16}
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

EditUserUsernameStep.propTypes = {
  id: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

EditUserUsernameStep.defaultProps = {
  onBack: undefined,
};

export default EditUserUsernameStep;
