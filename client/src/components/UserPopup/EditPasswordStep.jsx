import React, {
  useCallback, useEffect, useMemo, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Message } from 'semantic-ui-react';
import { Input, Popup } from '../../lib/custom-ui';

import {
  useDidUpdate, useForm, usePrevious, useToggle,
} from '../../hooks';

import styles from './EditNameStep.module.css';

const createMessage = (error) => {
  if (!error) {
    return error;
  }

  switch (error.message) {
    case 'Current password is not valid':
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

const EditPasswordStep = React.memo(
  ({
    defaultData, isSubmitting, error, onUpdate, onMessageDismiss, onBack, onClose,
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
      if (!data.password) {
        passwordField.current.select();
        return;
      }

      if (!data.currentPassword) {
        currentPasswordField.current.focus();
        return;
      }

      onUpdate(data);
    }, [onUpdate, data]);

    useEffect(() => {
      passwordField.current.select();
    }, []);

    useEffect(() => {
      if (wasSubmitting && !isSubmitting) {
        if (!error) {
          onClose();
        } else if (error.message === 'Current password is not valid') {
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
            <Input
              fluid
              ref={passwordField}
              name="password"
              value={data.password}
              className={styles.field}
              onChange={handleFieldChange}
            />
            <div className={styles.text}>{t('common.currentPassword')}</div>
            <Input
              fluid
              ref={currentPasswordField}
              type="password"
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

EditPasswordStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

EditPasswordStep.defaultProps = {
  error: undefined,
};

export default EditPasswordStep;
