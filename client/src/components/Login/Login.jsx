import isEmail from 'validator/lib/isEmail';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAuth } from 'react-oidc-context';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Form, Grid, Header, Message } from 'semantic-ui-react';
import { useDidUpdate, usePrevious, useToggle } from '../../lib/hooks';
import { Input } from '../../lib/custom-ui';

import { useForm } from '../../hooks';
import { isUsername } from '../../utils/validator';

import styles from './Login.module.scss';

const createMessage = (error) => {
  if (!error) {
    return error;
  }

  switch (error.message) {
    case 'Invalid email or username':
      return {
        type: 'error',
        content: 'common.invalidEmailOrUsername',
      };
    case 'Invalid password':
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
  ({ defaultData, isSubmitting, error, onAuthenticate, onMessageDismiss }) => {
    const auth = useAuth();
    const [t] = useTranslation();
    const wasSubmitting = usePrevious(isSubmitting);

    const [data, handleFieldChange, setData] = useForm(() => ({
      emailOrUsername: '',
      password: '',
      ...defaultData,
    }));

    const message = useMemo(() => createMessage(error), [error]);
    const [focusPasswordFieldState, focusPasswordField] = useToggle();

    const emailOrUsernameField = useRef(null);
    const passwordField = useRef(null);

    const handleSubmit = useCallback(() => {
      const cleanData = {
        ...data,
        emailOrUsername: data.emailOrUsername.trim(),
      };

      if (!isEmail(cleanData.emailOrUsername) && !isUsername(cleanData.emailOrUsername)) {
        emailOrUsernameField.current.select();
        return;
      }

      if (!cleanData.password) {
        passwordField.current.focus();
        return;
      }

      onAuthenticate(cleanData);
    }, [onAuthenticate, data]);

    useEffect(() => {
      emailOrUsernameField.current.focus();
    }, []);

    useEffect(() => {
      if (wasSubmitting && !isSubmitting && error) {
        switch (error.message) {
          case 'Invalid email or username':
            emailOrUsernameField.current.select();

            break;
          case 'Invalid password':
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
      <div className={classNames(styles.wrapper, styles.fullHeight)}>
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
                        <div className={styles.inputLabel}>{t('common.emailOrUsername')}</div>
                        <Input
                          fluid
                          ref={emailOrUsernameField}
                          name="emailOrUsername"
                          value={data.emailOrUsername}
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
                    <Form.Button type="button" onClick={() => auth.signinRedirect()}>
                      Log in with SSO
                    </Form.Button>
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
                content={t('common.projectManagement')}
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
