import isEmail from 'validator/lib/isEmail';
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Message } from 'semantic-ui-react';
import { withPopup } from '../../lib/popup';
import { Input, Popup } from '../../lib/custom-ui';

import {
  useDeepCompareCallback, useDeepCompareEffect, useForm, usePrevious,
} from '../../hooks';

import styles from './AddUserPopup.module.css';

const AddUserPopup = React.memo(
  ({
    defaultData, isSubmitting, error, onCreate, onMessageDismiss, onClose,
  }) => {
    const [t] = useTranslation();
    const wasSubmitting = usePrevious(isSubmitting);

    const [data, handleFieldChange] = useForm(() => ({
      email: '',
      password: '',
      name: '',
      ...defaultData,
    }));

    const emailField = useRef(null);
    const passwordField = useRef(null);
    const nameField = useRef(null);

    const handleSubmit = useDeepCompareCallback(() => {
      const cleanData = {
        ...data,
        email: data.email.trim(),
        name: data.name.trim(),
      };

      if (!isEmail(cleanData.email)) {
        emailField.current.select();
        return;
      }

      if (!cleanData.password) {
        passwordField.current.focus();
        return;
      }

      if (!cleanData.name) {
        nameField.current.select();
        return;
      }

      onCreate(cleanData);
    }, [onCreate, data]);

    useEffect(() => {
      emailField.current.select();
    }, []);

    useDeepCompareEffect(() => {
      if (wasSubmitting && !isSubmitting) {
        if (!error) {
          onClose();
        } else if (error.message === 'userIsAlreadyExist') {
          emailField.current.select();
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
          {error && (
            <Message
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...{
                [error.type || 'error']: true,
              }}
              visible
              content={t(`common.${error.message}`)}
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
            <Input
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

AddUserPopup.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onCreate: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

AddUserPopup.defaultProps = {
  error: undefined,
};

export default withPopup(AddUserPopup);
