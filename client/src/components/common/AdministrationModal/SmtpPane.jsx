/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Checkbox, Divider, Form, Header, Tab, TextArea } from 'semantic-ui-react';
import { Input } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, useNestedRef } from '../../../hooks';

import styles from './SmtpPane.module.scss';

const SmtpPane = React.memo(() => {
  const config = useSelector(selectors.selectConfig);
  const smtpTest = useSelector(selectors.selectSmtpTest);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [passwordFieldRef, handlePasswordFieldRef] = useNestedRef('inputRef');

  const defaultData = useMemo(
    () => ({
      smtpHost: config.smtpHost,
      smtpPort: config.smtpPort,
      smtpName: config.smtpName,
      smtpSecure: config.smtpSecure,
      smtpTlsRejectUnauthorized: config.smtpTlsRejectUnauthorized,
      smtpUser: config.smtpUser,
      smtpPassword: config.smtpPassword,
      smtpFrom: config.smtpFrom,
    }),
    [config],
  );

  const [data, handleFieldChange] = useForm(() => ({
    ...defaultData,
    smtpHost: defaultData.smtpHost || '',
    smtpPort: defaultData.smtpPort || '',
    smtpName: defaultData.smtpName || '',
    smtpSecure: defaultData.smtpSecure,
    smtpTlsRejectUnauthorized: defaultData.smtpTlsRejectUnauthorized,
    smtpUser: defaultData.smtpUser || '',
    smtpPassword: defaultData.smtpPassword || '',
    smtpFrom: defaultData.smtpFrom || '',
  }));

  const isPasswordSet = defaultData.smtpPassword === undefined;

  const cleanData = useMemo(
    () => ({
      ...data,
      smtpHost: data.smtpHost.trim() || null,
      smtpPort: parseInt(data.smtpPort, 10) || null,
      smtpName: data.smtpName.trim() || null,
      smtpUser: data.smtpUser.trim() || null,
      smtpPassword: data.smtpPassword || (isPasswordSet ? undefined : null),
      smtpFrom: data.smtpFrom.trim() || null,
    }),
    [data, isPasswordSet],
  );

  const handleSubmit = useCallback(() => {
    dispatch(entryActions.updateConfig(cleanData));
  }, [dispatch, cleanData]);

  const handlePasswordClear = useCallback(() => {
    dispatch(
      entryActions.updateConfig({
        smtpPassword: null,
      }),
    );

    passwordFieldRef.current.focus();
  }, [dispatch, passwordFieldRef]);

  const handleTestClick = useCallback(() => {
    dispatch(entryActions.testSmtpConfig());
  }, [dispatch]);

  const isModified = !dequal(cleanData, defaultData);

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Form onSubmit={handleSubmit}>
        <div className={styles.text}>{t('common.host')}</div>
        <Input
          fluid
          name="smtpHost"
          value={data.smtpHost}
          maxLength={256}
          className={styles.field}
          onChange={handleFieldChange}
        />
        <div className={styles.text}>{t('common.port')}</div>
        <Input
          fluid
          type="number"
          name="smtpPort"
          value={data.smtpPort}
          placeholder={data.smtpSecure ? '465' : '587'}
          min={0}
          max={65535}
          step={1}
          className={styles.field}
          onChange={handleFieldChange}
        />
        <div className={styles.text}>
          {t('common.clientHostnameInEhlo')} (
          {t('common.optional', {
            context: 'inline',
          })}
          )
        </div>
        <Input
          fluid
          name="smtpName"
          value={data.smtpName}
          maxLength={256}
          className={styles.field}
          onChange={handleFieldChange}
        />
        <Checkbox
          name="smtpSecure"
          checked={data.smtpSecure}
          label={t('common.useSecureConnection')}
          className={styles.checkbox}
          onChange={handleFieldChange}
        />
        <Checkbox
          name="smtpTlsRejectUnauthorized"
          checked={data.smtpTlsRejectUnauthorized}
          label={t('common.rejectUnauthorizedTlsCertificates')}
          className={classNames(styles.field, styles.checkbox)}
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
          name="smtpUser"
          value={data.smtpUser}
          maxLength={256}
          className={styles.field}
          onChange={handleFieldChange}
        />
        <div className={styles.text}>
          {t('common.password')} (
          {t('common.optional', {
            context: 'inline',
          })}
          )
        </div>
        <Input.Password
          fluid
          ref={handlePasswordFieldRef}
          name="smtpPassword"
          value={data.smtpPassword}
          placeholder={isPasswordSet ? t('common.passwordIsSet') : undefined}
          maxLength={256}
          className={styles.field}
          onClear={!data.smtpPassword && isPasswordSet ? handlePasswordClear : undefined}
          onChange={handleFieldChange}
        />
        <div className={styles.text}>
          {t('common.defaultFrom')} (
          {t('common.optional', {
            context: 'inline',
          })}
          )
        </div>
        <Input
          fluid
          name="smtpFrom"
          value={data.smtpFrom}
          maxLength={256}
          className={styles.field}
          onChange={handleFieldChange}
        />
        <div className={styles.controls}>
          <Button positive disabled={!isModified} content={t('action.save')} />
          {config.smtpHost && !isModified && (
            <Button
              type="button"
              content={t('action.sendTestEmail')}
              loading={smtpTest.isLoading}
              disabled={smtpTest.isLoading}
              onClick={handleTestClick}
            />
          )}
        </div>
      </Form>
      {smtpTest.logs && (
        <>
          <Divider horizontal>
            <Header as="h4">
              {t('common.testLog', {
                context: 'title',
              })}
            </Header>
          </Divider>
          <TextArea
            readOnly
            as={TextareaAutosize}
            value={smtpTest.logs.join('\n')}
            className={styles.testLog}
          />
        </>
      )}
    </Tab.Pane>
  );
});

export default SmtpPane;
