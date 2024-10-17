import isEmail from 'validator/lib/isEmail';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Message } from 'semantic-ui-react';
import { usePrevious } from '../../lib/hooks';
import { Input, Popup } from '../../lib/custom-ui';

import { useForm } from '../../hooks';
import { isPassword, isUsername } from '../../utils/validator';

import styles from './UserAddStep.module.scss';

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

const UserAddStep = React.memo(
  ({ defaultData, isSubmitting, error, onCreate, onMessageDismiss, onClose }) => {
    const [t] = useTranslation();
    const wasSubmitting = usePrevious(isSubmitting);

    const [data, handleFieldChange] = useForm(() => ({
      email: '',
      password: '',
      name: '',
      username: '',
      ...defaultData,
    }));

    const message = useMemo(() => createMessage(error), [error]);

    const emailField = useRef(null);
    const passwordField = useRef(null);
    const nameField = useRef(null);
    const usernameField = useRef(null);

    const handleSubmit = useCallback(() => {
      const cleanData = {
        ...data,
        email: data.email.trim(),
        name: data.name.trim(),
        username: data.username.trim() || null,
      };

      if (!isEmail(cleanData.email)) {
        emailField.current.select();
        return;
      }

      if (!cleanData.password || !isPassword(cleanData.password)) {
        passwordField.current.focus();
        return;
      }

      if (!cleanData.name) {
        nameField.current.select();
        return;
      }

      if (cleanData.username && !isUsername(cleanData.username)) {
        usernameField.current.select();
        return;
      }

      onCreate(cleanData);
    }, [onCreate, data]);

    useEffect(() => {
      emailField.current.focus({
        preventScroll: true,
      });
    }, []);

    useEffect(() => {
      if (wasSubmitting && !isSubmitting) {
        if (error) {
          switch (error.message) {
            case 'Email already in use':
              emailField.current.select();

              break;
            case 'Username already in use':
              usernameField.current.select();

              break;
            default:
          }
        } else {
          onClose();
        }
      }
    }, [isSubmitting, wasSubmitting, error, onClose]);

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
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...{
                [message.type]: true,
              }}
              visible
              content={t(message.content)}
              onDismiss={onMessageDismiss}
            />
          )}
          <Form onSubmit={handleSubmit}>
            <div className={styles.text}>{t('common.email')}</div>
            <Input
              fluid
              ref={emailField}
              name="email"
              value={data.email}
              readOnly={isSubmitting}
              className={styles.field}
              onChange={handleFieldChange}
            />
            <div className={styles.text}>{t('common.password')}</div>
            <Input.Password
              withStrengthBar
              fluid
              ref={passwordField}
              name="password"
              value={data.password}
              readOnly={isSubmitting}
              className={styles.field}
              onChange={handleFieldChange}
            />
            <div className={styles.text}>{t('common.name')}</div>
            <Input
              fluid
              ref={nameField}
              name="name"
              value={data.name}
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
              ref={usernameField}
              name="username"
              value={data.username}
              readOnly={isSubmitting}
              className={styles.field}
              onChange={handleFieldChange}
            />
            <Button
              positive
              content={t('action.addUser')}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </Form>
        </Popup.Content>
      </>
    );
  },
);

UserAddStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onCreate: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

UserAddStep.defaultProps = {
  error: undefined,
};

export default UserAddStep;
