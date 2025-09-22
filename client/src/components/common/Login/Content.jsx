/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import isEmail from 'validator/lib/isEmail';
import React, { useCallback, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { Button, Divider, Form, Grid, Header, Message } from 'semantic-ui-react';
import { useDidUpdate, usePrevious, useToggle } from '../../../lib/hooks';
import { Input } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, useNestedRef } from '../../../hooks';
import { isUsername } from '../../../utils/validator';
import AccessTokenSteps from '../../../constants/AccessTokenSteps';
import TermsModal from './TermsModal';

import styles from './Content.module.scss';

const createMessage = (error) => {
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
        content: 'common.unknownError',
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
    step,
  } = useSelector(selectors.selectAuthenticateForm);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const wasSubmitting = usePrevious(isSubmitting);

  const [data, handleFieldChange, setData] = useForm(() => ({
    emailOrUsername: '',
    password: '',
    ...defaultData,
  }));

  const message = useMemo(() => createMessage(error), [error]);
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

  const withOidc = !!bootstrap.oidc;
  const isOidcEnforced = withOidc && bootstrap.oidc.isEnforced;

  useEffect(() => {
    if (!isOidcEnforced) {
      emailOrUsernameFieldRef.current.focus();
    }
  }, [emailOrUsernameFieldRef, isOidcEnforced]);

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
      <Grid verticalAlign="middle" className={classNames(styles.grid, styles.fullHeight)}>
        <Grid.Column computer={6} tablet={16} mobile={16}>
          <div className={styles.loginWrapper}>
            <Header as="h1" textAlign="center" content="PLANKA" className={styles.formTitle} />
            <Header
              as="h2"
              textAlign="center"
              content={t('common.logIn', {
                context: 'title',
              })}
              className={styles.formSubtitle}
            />
            <div className={styles.formWrapper}>
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
              {!isOidcEnforced && (
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
                  {withOidc && (
                    <Divider horizontal content={t('common.or')} className={styles.divider} />
                  )}
                </>
              )}
              {withOidc && (
                <Button
                  fluid
                  primary={isOidcEnforced}
                  icon={isOidcEnforced ? 'right arrow' : undefined}
                  labelPosition={isOidcEnforced ? 'right' : undefined}
                  content={t('action.logInWithSso')}
                  loading={isSubmittingWithOidc}
                  disabled={isSubmitting || isSubmittingWithOidc}
                  onClick={handleAuthenticateWithOidcClick}
                />
              )}
            </div>
            <p className={styles.formFooter}>
              <Trans i18nKey="common.poweredByPlanka">
                {'Powered by '}
                <a href="https://github.com/plankanban/planka" target="_blank" rel="noreferrer">
                  PLANKA
                </a>
              </Trans>
            </p>
          </div>
        </Grid.Column>
        <Grid.Column
          computer={10}
          only="computer"
          className={classNames(styles.cover, styles.fullHeight)}
        >
          <div className={styles.coverOverlay} />
        </Grid.Column>
      </Grid>
      {step === AccessTokenSteps.ACCEPT_TERMS && <TermsModal />}
    </div>
  );
});

export default Content;
