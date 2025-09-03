/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import isEmail from 'validator/lib/isEmail';
import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form, Icon, Message } from 'semantic-ui-react';
import { useDidUpdate, usePrevious } from '../../../../lib/hooks';
import { Input, Popup } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { useForm, useNestedRef, useSteps } from '../../../../hooks';
import { isPassword, isUsername } from '../../../../utils/validator';
import { UserRoles } from '../../../../constants/Enums';
import { UserRoleIcons } from '../../../../constants/Icons';
import SelectRoleStep from './SelectRoleStep';

import styles from './AddStep.module.scss';

const StepTypes = {
  SELECT_ROLE: 'SELECT_ROLE',
};

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
    case 'Username already in use':
      return {
        type: 'error',
        content: 'common.usernameAlreadyInUse',
      };
    default:
      return {
        type: 'warning',
        content: 'common.unknownError',
      };
  }
};

const AddStep = React.memo(({ onClose }) => {
  const { data: defaultData, isSubmitting, error } = useSelector(selectors.selectUserCreateForm);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const wasSubmitting = usePrevious(isSubmitting);

  const [data, handleFieldChange, setData] = useForm(() => ({
    email: '',
    password: '',
    name: '',
    username: '',
    role: UserRoles.BOARD_USER,
    ...defaultData,
  }));

  const [step, openStep, handleBack] = useSteps();
  const message = useMemo(() => createMessage(error), [error]);

  const [emailFieldRef, handleEmailFieldRef] = useNestedRef('inputRef');
  const [passwordFieldRef, handlePasswordFieldRef] = useNestedRef('inputRef');
  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');
  const [usernameFieldRef, handleUsernameFieldRef] = useNestedRef('inputRef');

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      email: data.email.trim(),
      name: data.name.trim(),
      username: data.username.trim() || null,
    };

    if (!isEmail(cleanData.email)) {
      emailFieldRef.current.select();
      return;
    }

    if (!cleanData.password || !isPassword(cleanData.password)) {
      passwordFieldRef.current.focus();
      return;
    }

    if (!cleanData.name) {
      nameFieldRef.current.select();
      return;
    }

    if (cleanData.username && !isUsername(cleanData.username)) {
      usernameFieldRef.current.select();
      return;
    }

    dispatch(entryActions.createUser(cleanData));
  }, [dispatch, data, emailFieldRef, passwordFieldRef, nameFieldRef, usernameFieldRef]);

  const handleRoleSelect = useCallback(
    (role) => {
      setData((prevData) => ({
        ...prevData,
        role,
      }));
    },
    [setData],
  );

  const handleMessageDismiss = useCallback(() => {
    dispatch(entryActions.clearUserCreateError());
  }, [dispatch]);

  const handleSelectRoleClick = useCallback(() => {
    openStep(StepTypes.SELECT_ROLE);
  }, [openStep]);

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
          case 'Username already in use':
            usernameFieldRef.current.select();

            break;
          default:
        }
      } else {
        onClose();
      }
    }
  }, [onClose, isSubmitting, wasSubmitting, error]);

  if (step && step.type === StepTypes.SELECT_ROLE) {
    return (
      <SelectRoleStep defaultValue={data.role} onSelect={handleRoleSelect} onBack={handleBack} />
    );
  }

  return (
    <>
      <Popup.Header>
        {t('common.addUser', {
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
          <div className={styles.text}>{t('common.email')}</div>
          <Input
            fluid
            ref={handleEmailFieldRef}
            name="email"
            value={data.email}
            maxLength={256}
            readOnly={isSubmitting}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <div className={styles.text}>{t('common.password')}</div>
          <Input.Password
            withStrengthBar
            fluid
            ref={handlePasswordFieldRef}
            name="password"
            value={data.password}
            maxLength={256}
            readOnly={isSubmitting}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <div className={styles.text}>{t('common.name')}</div>
          <Input
            fluid
            ref={handleNameFieldRef}
            name="name"
            value={data.name}
            maxLength={128}
            readOnly={isSubmitting}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <div className={styles.text}>
            {t('common.username')} (
            {t('common.optional', {
              context: 'inline',
            })}
            )
          </div>
          <Input
            fluid
            ref={handleUsernameFieldRef}
            name="username"
            value={data.username}
            maxLength={16}
            readOnly={isSubmitting}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <div className={styles.controls}>
            <Button
              positive
              content={t('action.addUser')}
              loading={isSubmitting}
              disabled={isSubmitting}
              className={styles.button}
            />
            <Button
              type="button"
              className={classNames(styles.button, styles.selectRoleButton)}
              onClick={handleSelectRoleClick}
            >
              <Icon name={UserRoleIcons[data.role]} className={styles.selectRoleButtonIcon} />
              {t(`common.${data.role}`)}
            </Button>
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

AddStep.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddStep;
