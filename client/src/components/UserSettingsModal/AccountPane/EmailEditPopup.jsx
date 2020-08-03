import isEmail from 'validator/lib/isEmail';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Message } from 'semantic-ui-react';
import { useDidUpdate, usePrevious, useToggle } from '../../../lib/hooks';
import { withPopup } from '../../../lib/popup';
import { Input, Popup } from '../../../lib/custom-ui';

import { useForm } from '../../../hooks';

import styles from './EmailEditPopup.module.scss';

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

const EmailEditStep = React.memo(
  ({ defaultData, email, isSubmitting, error, onUpdate, onMessageDismiss, onClose }) => {
    const [t] = useTranslation();
    const wasSubmitting = usePrevious(isSubmitting);

    const [data, handleFieldChange, setData] = useForm({
      email: '',
      currentPassword: '',
      ...defaultData,
    });

    const message = useMemo(() => createMessage(error), [error]);
    const [focusCurrentPasswordFieldState, focusCurrentPasswordField] = useToggle();

    const emailField = useRef(null);
    const currentPasswordField = useRef(null);

    const handleSubmit = useCallback(() => {
      const cleanData = {
        ...data,
        email: data.email.trim(),
      };

      if (!isEmail(cleanData.email)) {
        emailField.current.select();
        return;
      }

      if (cleanData.email === email) {
        onClose();
        return;
      }

      if (!cleanData.currentPassword) {
        currentPasswordField.current.focus();
        return;
      }

      onUpdate(cleanData);
    }, [email, onUpdate, onClose, data]);

    useEffect(() => {
      emailField.current.select();
    }, []);

    useEffect(() => {
      if (wasSubmitting && !isSubmitting) {
        if (error) {
          switch (error.message) {
            case 'Email already in use':
              emailField.current.select();

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
    }, [isSubmitting, wasSubmitting, error, onClose, setData, focusCurrentPasswordField]);

    useDidUpdate(() => {
      currentPasswordField.current.focus();
    }, [focusCurrentPasswordFieldState]);

    return (
      <>
        <Popup.Header>
          {t('common.editEmail', {
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
            <div className={styles.text}>{t('common.newEmail')}</div>
            <Input
              fluid
              ref={emailField}
              name="email"
              value={data.email}
              placeholder={email}
              className={styles.field}
              onChange={handleFieldChange}
            />
            <div className={styles.text}>{t('common.currentPassword')}</div>
            <Input.Password
              fluid
              ref={currentPasswordField}
              name="currentPassword"
              value={data.currentPassword}
              className={styles.field}
              onChange={handleFieldChange}
            />
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
  },
);

EmailEditStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  email: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

EmailEditStep.defaultProps = {
  error: undefined,
};

export default withPopup(EmailEditStep);
