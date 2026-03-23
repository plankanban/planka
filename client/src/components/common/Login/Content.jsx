/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import isEmail from 'validator/lib/isEmail';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Divider, Form, Grid, Header, Message, TextArea } from 'semantic-ui-react';
import { useDidUpdate, usePrevious, useToggle } from '../../../lib/hooks';
import { Input } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, useNestedRef } from '../../../hooks';
import { isUsername } from '../../../utils/validator';
import AccessTokenSteps from '../../../constants/AccessTokenSteps';
import TermsModal from './TermsModal';

import logo from '../../../assets/images/logo.png';

import styles from './Content.module.scss';

const createMessage = (error, isDebug) => {
  if (!error) {
    return error;
  }

  switch (error.message) {
    case 'Invalid credentials':
      return {
        type: 'error',
        content: 'common.invalidCredentials',
      };
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
    case 'Use single sign-on':
      return {
        type: 'error',
        content: 'common.useSingleSignOn',
      };
    case 'Admin login required to initialize instance':
      return {
        type: 'error',
        content: 'common.adminLoginRequiredToInitializeInstance',
      };
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
    case 'Active users limit reached':
      return {
        type: 'error',
        content: 'common.activeUsersLimitReached',
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
        content: isDebug ? error.message : 'common.unknownError',
      };
  }
};

const Content = React.memo(() => {
  const bootstrap = useSelector(selectors.selectBootstrap);

  const {
    data: defaultData,
    isSubmitting,
    isSubmittingWithOidc,
    error,
    debugLogs,
    step,
  } = useSelector(selectors.selectAuthenticateForm);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const wasSubmitting = usePrevious(isSubmitting);

  const [showRegister, setShowRegister] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [data, handleFieldChange, setData] = useForm(() => {
    const initialData = {
      emailOrUsername: '',
      password: '',
      registerEmail: '',
      registerPassword: '',
      registerName: '',
      registerUsername: '',
      ...defaultData,
    };

    if (bootstrap.isDemoMode) {
      const params = new URLSearchParams(window.location.hash.slice(1));

      Object.keys(initialData).forEach((fieldName) => {
        const value = params.get(fieldName);

        if (value !== null) {
          initialData[fieldName] = value;
        }
      });
    }

    return initialData;
  });

  const withOidc = !!bootstrap.oidc;
  const isOidcEnforced = withOidc && bootstrap.oidc.isEnforced;
  const isOidcDebug = withOidc && bootstrap.oidc.debug;

  const message = useMemo(() => createMessage(error, isOidcDebug), [error, isOidcDebug]);
  const [focusPasswordFieldState, focusPasswordField] = useToggle();

  const [emailOrUsernameFieldRef, handleEmailOrUsernameFieldRef] = useNestedRef('inputRef');
  const [passwordFieldRef, handlePasswordFieldRef] = useNestedRef('inputRef');

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      emailOrUsername: data.emailOrUsername.trim(),
    };

    if (!isEmail(cleanData.emailOrUsername) && !isUsername(cleanData.emailOrUsername)) {
      emailOrUsernameFieldRef.current.select();
      return;
    }

    if (!cleanData.password) {
      passwordFieldRef.current.focus();
      return;
    }

    dispatch(entryActions.authenticate(cleanData));
  }, [dispatch, data, emailOrUsernameFieldRef, passwordFieldRef]);

  const handleAuthenticateWithOidcClick = useCallback(() => {
    dispatch(entryActions.authenticateWithOidc());
  }, [dispatch]);

  const handleMessageDismiss = useCallback(() => {
    dispatch(entryActions.clearAuthenticateError());
  }, [dispatch]);

  const handleRegisterSubmit = useCallback(async () => {
    if (!data.registerName.trim() || !data.registerEmail.trim() || !data.registerPassword) {
      setRegisterMessage({ type: 'error', content: 'Please fill in all required fields.' });
      return;
    }

    setIsRegistering(true);
    setRegisterMessage(null);

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.registerEmail.trim(),
          password: data.registerPassword,
          name: data.registerName.trim(),
          username: data.registerUsername.trim() || undefined,
        }),
      });

      if (response.ok) {
        setRegisterMessage({ type: 'success', content: 'Account created! You can now log in.' });
        setShowRegister(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || 'Registration failed. Please try again.';
        setRegisterMessage({ type: 'error', content: errorMsg });
      }
    } catch {
      setRegisterMessage({ type: 'error', content: 'Connection failed. Please try again.' });
    } finally {
      setIsRegistering(false);
    }
  }, [data]);

  useEffect(() => {
    if (!isOidcEnforced) {
      emailOrUsernameFieldRef.current.focus();
    }
  }, [isOidcEnforced, emailOrUsernameFieldRef]);

  useDidUpdate(() => {
    if (wasSubmitting && !isSubmitting && error) {
      switch (error.message) {
        case 'Invalid credentials':
        case 'Invalid email or username':
          emailOrUsernameFieldRef.current.select();

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
  }, [isSubmitting, wasSubmitting, error]);

  useDidUpdate(() => {
    passwordFieldRef.current.focus();
  }, [focusPasswordFieldState]);

  return (
    <div className={classNames(styles.wrapper, styles.fullHeight)}>
      <Grid verticalAlign="middle" className={styles.grid}>
        <Grid.Column computer={6} tablet={16} mobile={16} className={styles.gridItem}>
          <div className={styles.login}>
            <div className={styles.form}>
              <div className={styles.logoWrapper}>
                <img src={bootstrap.loginLogoUrl || logo} alt="" className={styles.logo} />
              </div>
              <Header
                as="h1"
                textAlign="center"
                content={bootstrap.loginAppName || bootstrap.instanceName || 'PLANKA'}
                className={styles.formTitle}
              />
              <Header
                as="h2"
                textAlign="center"
                content={showRegister ? 'Register' : t('common.logIn', { context: 'title' })}
                className={styles.formSubtitle}
              />
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
              {registerMessage && (
                <Message
                  {...{ [registerMessage.type]: true }}
                  visible
                  content={registerMessage.content}
                  onDismiss={() => setRegisterMessage(null)}
                />
              )}
              {!isOidcEnforced && (
                <>
                  {!showRegister ? (
                    <>
                      <Form size="large" onSubmit={handleSubmit}>
                        <div className={styles.inputWrapper}>
                          <div className={styles.inputLabel}>{t('common.emailOrUsername')}</div>
                          <Input
                            fluid
                            ref={handleEmailOrUsernameFieldRef}
                            name="emailOrUsername"
                            value={data.emailOrUsername}
                            maxLength={256}
                            readOnly={isSubmitting}
                            className={styles.input}
                            onChange={handleFieldChange}
                          />
                        </div>
                        <div className={styles.inputWrapper}>
                          <div className={styles.inputLabel}>{t('common.password')}</div>
                          <Input.Password
                            fluid
                            ref={handlePasswordFieldRef}
                            name="password"
                            value={data.password}
                            maxLength={256}
                            readOnly={isSubmitting}
                            className={styles.input}
                            onChange={handleFieldChange}
                          />
                          <div className={styles.forgotPassword}>
                            <button
                              type="button"
                              className={styles.forgotPasswordLink}
                              onClick={() => setShowForgotPassword((prev) => !prev)}
                            >
                              {t('common.forgotPassword')}
                            </button>
                            {showForgotPassword && (
                              <div className={styles.forgotPasswordMessage}>
                                {t('common.forgotPasswordMessage')}
                              </div>
                            )}
                          </div>
                        </div>
                        <Form.Button
                          fluid
                          primary
                          icon="right arrow"
                          labelPosition="right"
                          content={t('action.logIn')}
                          loading={isSubmitting}
                          disabled={isSubmitting || isSubmittingWithOidc}
                        />
                      </Form>
                      {bootstrap.registrationEnabled && (
                        <div className={styles.registerLink}>
                          <button type="button" className={styles.registerButton} onClick={() => setShowRegister(true)}>
                            Don&apos;t have an account? Register
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Form size="large" onSubmit={handleRegisterSubmit}>
                        <div className={styles.inputWrapper}>
                          <div className={styles.inputLabel}>Name</div>
                          <Input
                            fluid
                            name="registerName"
                            value={data.registerName}
                            maxLength={128}
                            className={styles.input}
                            onChange={handleFieldChange}
                          />
                        </div>
                        <div className={styles.inputWrapper}>
                          <div className={styles.inputLabel}>E-mail</div>
                          <Input
                            fluid
                            name="registerEmail"
                            value={data.registerEmail}
                            maxLength={256}
                            className={styles.input}
                            onChange={handleFieldChange}
                          />
                        </div>
                        <div className={styles.inputWrapper}>
                          <div className={styles.inputLabel}>Username (optional)</div>
                          <Input
                            fluid
                            name="registerUsername"
                            value={data.registerUsername}
                            maxLength={64}
                            className={styles.input}
                            onChange={handleFieldChange}
                          />
                        </div>
                        <div className={styles.inputWrapper}>
                          <div className={styles.inputLabel}>Password</div>
                          <Input.Password
                            fluid
                            name="registerPassword"
                            value={data.registerPassword}
                            maxLength={256}
                            className={styles.input}
                            onChange={handleFieldChange}
                          />
                        </div>
                        <Form.Button
                          fluid
                          positive
                          content="Register"
                          loading={isRegistering}
                          disabled={isRegistering}
                        />
                      </Form>
                      <div className={styles.registerLink}>
                        <button type="button" className={styles.registerButton} onClick={() => setShowRegister(false)}>
                          Already have an account? Log in
                        </button>
                      </div>
                    </>
                  )}
                  {withOidc && (
                    <Divider horizontal content={t('common.or')} className={styles.divider} />
                  )}
                </>
              )}
              {withOidc && (
                <>
                  <Button
                    fluid
                    primary={isOidcDebug ? undefined : isOidcEnforced}
                    color={isOidcDebug ? 'orange' : undefined}
                    icon={isOidcEnforced ? 'right arrow' : undefined}
                    labelPosition={isOidcEnforced ? 'right' : undefined}
                    content={isOidcDebug ? t('action.debugSso') : t('action.logInWithSso')}
                    loading={isSubmittingWithOidc}
                    disabled={isSubmitting || isSubmittingWithOidc}
                    onClick={handleAuthenticateWithOidcClick}
                  />
                  {debugLogs && (
                    <TextArea
                      readOnly
                      as={TextareaAutosize}
                      value={debugLogs.join('\n')}
                      className={styles.debugLog}
                    />
                  )}
                </>
              )}
            </div>
            {!bootstrap.hidePoweredBy && (
              <div className={styles.poweredBy}>
                <p className={styles.poweredByText}>
                  <Trans i18nKey="common.poweredByPlanka">
                    {'Powered by '}
                    <a href="https://github.com/plankanban/planka" target="_blank" rel="noreferrer">
                      PLANKA
                    </a>
                  </Trans>
                </p>
              </div>
            )}
          </div>
        </Grid.Column>
        <Grid.Column
          computer={10}
          only="computer"
          className={classNames(styles.gridItem, styles.cover)}
          style={bootstrap.loginBackgroundUrl ? { background: `url("${bootstrap.loginBackgroundUrl}") center / cover` } : undefined}
        >
          <div className={styles.coverOverlay} />
        </Grid.Column>
      </Grid>
      {step === AccessTokenSteps.ACCEPT_TERMS && <TermsModal />}
    </div>
  );
});

export default Content;
