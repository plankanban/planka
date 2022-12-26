import omit from 'lodash/omit';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Message } from 'semantic-ui-react';
import { useDidUpdate, usePrevious, useToggle } from '../../lib/hooks';
import { Input, Popup } from '../../lib/custom-ui';

import { useForm } from '../../hooks';
import { isPassword } from '../../utils/validator';

import styles from './UserPasswordEditStep.module.scss';

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

const UserPasswordEditStep = React.memo(
  ({
    defaultData,
    isSubmitting,
    error,
    usePasswordConfirmation,
    onUpdate,
    onMessageDismiss,
    onBack,
    onClose,
  }) => {
    const [t] = useTranslation();
    const wasSubmitting = usePrevious(isSubmitting);

    const [data, handleFieldChange, setData] = useForm({
      password: '',
      currentPassword: '',
      ...defaultData,
    });

    const message = useMemo(() => createMessage(error), [error]);
    const [focusCurrentPasswordFieldState, focusCurrentPasswordField] = useToggle();

    const passwordField = useRef(null);
    const currentPasswordField = useRef(null);

    const handleSubmit = useCallback(() => {
      if (!data.password || !isPassword(data.password)) {
        passwordField.current.select();
        return;
      }

      if (usePasswordConfirmation && !data.currentPassword) {
        currentPasswordField.current.focus();
        return;
      }

      onUpdate(usePasswordConfirmation ? data : omit(data, 'currentPassword'));
    }, [usePasswordConfirmation, onUpdate, data]);

    useEffect(() => {
      passwordField.current.focus({
        preventScroll: true,
      });
    }, []);

    useEffect(() => {
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
    }, [isSubmitting, wasSubmitting, error, onClose, setData, focusCurrentPasswordField]);

    useDidUpdate(() => {
      currentPasswordField.current.focus();
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
            <div className={styles.text}>{t('common.newPassword')}</div>
            <Input.Password
              withStrengthBar
              fluid
              ref={passwordField}
              name="password"
              value={data.password}
              className={styles.field}
              onChange={handleFieldChange}
            />
            {usePasswordConfirmation && (
              <>
                <div className={styles.text}>{t('common.currentPassword')}</div>
                <Input.Password
                  fluid
                  ref={currentPasswordField}
                  name="currentPassword"
                  value={data.currentPassword}
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
  },
);

UserPasswordEditStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  usePasswordConfirmation: PropTypes.bool,
  onUpdate: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

UserPasswordEditStep.defaultProps = {
  error: undefined,
  usePasswordConfirmation: false,
  onBack: undefined,
};

export default UserPasswordEditStep;
