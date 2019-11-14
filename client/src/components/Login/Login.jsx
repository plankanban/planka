import React, {
  useCallback, useEffect, useMemo, useRef,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import isEmail from 'validator/lib/isEmail';
import {
  Form, Grid, Header, Message,
} from 'semantic-ui-react';
import { useDidUpdate, usePrevious, useToggle } from '../../lib/hooks';
import { Input } from '../../lib/custom-ui';

import { useForm } from '../../hooks';

import styles from './Login.module.css';

const createMessage = (error) => {
  if (!error) {
    return error;
  }

  switch (error.message) {
    case 'Email does not exist':
      return {
        type: 'error',
        content: 'common.emailDoesNotExist',
      };
    case 'Password is not valid':
      return {
        type: 'error',
        content: 'common.invalidPassword',
      };
    case 'Failed to fetch':
      return {
        type: 'warning',
        content: 'common.noInternetConnection',
      };
    case 'Network request failed':
      return {
        type: 'warning',
        content: 'common.serverConnectionFailed',
      };
    default:
      return {
        type: 'warning',
        content: 'common.unknownError',
      };
  }
};

const Login = React.memo(
  ({
    defaultData, isSubmitting, error, onAuthenticate, onMessageDismiss,
  }) => {
    const [t] = useTranslation();
    const wasSubmitting = usePrevious(isSubmitting);

    const [data, handleFieldChange, setData] = useForm(() => ({
      email: '',
      password: '',
      ...defaultData,
    }));

    const message = useMemo(() => createMessage(error), [error]);
    const [focusPasswordFieldState, focusPasswordField] = useToggle();

    const emailField = useRef(null);
    const passwordField = useRef(null);

    const handleSubmit = useCallback(() => {
      const cleanData = {
        ...data,
        email: data.email.trim(),
      };

      if (!isEmail(cleanData.email)) {
        emailField.current.select();
        return;
      }

      if (!cleanData.password) {
        passwordField.current.focus();
        return;
      }

      onAuthenticate(cleanData);
    }, [onAuthenticate, data]);

    useEffect(() => {
      emailField.current.select();
    }, []);

    useEffect(() => {
      if (wasSubmitting && !isSubmitting && error) {
        switch (error.message) {
          case 'Email does not exist':
            emailField.current.select();

            break;
          case 'Password is not valid':
            setData((prevData) => ({
              ...prevData,
              password: '',
            }));
            focusPasswordField();

            break;
          default:
        }
      }
    }, [isSubmitting, wasSubmitting, error, setData, focusPasswordField]);

    useDidUpdate(() => {
      passwordField.current.focus();
    }, [focusPasswordFieldState]);

    return (
      <div className={styles.fullHeight}>
        <Grid verticalAlign="middle" className={styles.fullHeightPaddingFix}>
          <Grid.Column widescreen={4} largeScreen={5} computer={6} tablet={16} mobile={16}>
            <Grid verticalAlign="middle" className={styles.fullHeightPaddingFix}>
              <Grid.Column>
                <div className={styles.loginWrapper}>
                  <Header
                    as="h1"
                    textAlign="center"
                    content={t('common.logInToPlanka')}
                    className={styles.formTitle}
                  />
                  <div>
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
                    <Form size="large" onSubmit={handleSubmit}>
                      <div className={styles.inputWrapper}>
                        <div className={styles.inputLabel}>{t('common.email')}</div>
                        <Input
                          fluid
                          ref={emailField}
                          name="email"
                          value={data.email}
                          readOnly={isSubmitting}
                          className={styles.input}
                          onChange={handleFieldChange}
                        />
                      </div>
                      <div className={styles.inputWrapper}>
                        <div className={styles.inputLabel}>{t('common.password')}</div>
                        <Input.Password
                          fluid
                          ref={passwordField}
                          name="password"
                          value={data.password}
                          readOnly={isSubmitting}
                          className={styles.input}
                          onChange={handleFieldChange}
                        />
                      </div>
                      <Form.Button
                        primary
                        size="large"
                        icon="right arrow"
                        labelPosition="right"
                        content={t('action.logIn')}
                        floated="right"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                      />
                    </Form>
                  </div>
                </div>
              </Grid.Column>
            </Grid>
          </Grid.Column>
          <Grid.Column
            widescreen={12}
            largeScreen={11}
            computer={10}
            only="computer"
            className={classNames(styles.cover, styles.fullHeight)}
          >
            <div className={styles.descriptionWrapperOverlay} />
            <div className={styles.descriptionWrapper}>
              <Header inverted as="h1" content="Planka" className={styles.descriptionTitle} />
              <Header
                inverted
                as="h2"
                content={t('common.projectManagment')}
                className={styles.descriptionSubtitle}
              />
            </div>
          </Grid.Column>
        </Grid>
      </div>
    );
  },
);

Login.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onAuthenticate: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
};

Login.defaultProps = {
  error: undefined,
};

export default Login;
