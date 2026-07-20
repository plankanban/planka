/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import omit from 'lodash/omit';
import React, { useCallback, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Checkbox, Divider, Form, Header, Tab, TextArea } from 'semantic-ui-react';
import { Input } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, useNestedRef } from '../../../hooks';

import styles from './LdapPane.module.scss';

const parseRolesList = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const LdapPane = React.memo(() => {
  const config = useSelector(selectors.selectConfig);
  const ldapTestState = useSelector(selectors.selectLdapTestState);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [bindPasswordFieldRef, handleBindPasswordFieldRef] = useNestedRef('inputRef');
  const [sshPasswordFieldRef, handleSshPasswordFieldRef] = useNestedRef('inputRef');
  const isBindPasswordTouchedRef = useRef(false);
  const isSshPasswordTouchedRef = useRef(false);

  const defaultData = useMemo(
    () => ({
      ldapEnabled: config.ldapEnabled,
      ldapHost: config.ldapHost,
      ldapPort: config.ldapPort,
      ldapTls: config.ldapTls,
      ldapBindDn: config.ldapBindDn,
      ldapBindPassword: config.ldapBindPassword,
      ldapBaseDn: config.ldapBaseDn,
      ldapUserFilter: config.ldapUserFilter,
      ldapNameAttribute: config.ldapNameAttribute,
      ldapEmailAttribute: config.ldapEmailAttribute,
      ldapUsernameAttribute: config.ldapUsernameAttribute,
      ldapRolesAttribute: config.ldapRolesAttribute,
      ldapAdminRoles: config.ldapAdminRoles,
      ldapProjectOwnerRoles: config.ldapProjectOwnerRoles,
      ldapBoardUserRoles: config.ldapBoardUserRoles,
      ldapSshTunnelEnabled: config.ldapSshTunnelEnabled,
      ldapSshHost: config.ldapSshHost,
      ldapSshPort: config.ldapSshPort,
      ldapSshUsername: config.ldapSshUsername,
      ldapSshPassword: config.ldapSshPassword,
      ldapSshRemoteHost: config.ldapSshRemoteHost,
      ldapSshRemotePort: config.ldapSshRemotePort,
      ldapSshHostKeyFingerprint: config.ldapSshHostKeyFingerprint,
    }),
    [config],
  );

  const [data, handleFieldChange] = useForm(() => ({
    ...defaultData,
    ldapEnabled: !!defaultData.ldapEnabled,
    ldapHost: defaultData.ldapHost || '',
    ldapPort:
      defaultData.ldapPort === null || defaultData.ldapPort === undefined
        ? ''
        : `${defaultData.ldapPort}`,
    ldapTls: !!defaultData.ldapTls,
    ldapBindDn: defaultData.ldapBindDn || '',
    ldapBindPassword: defaultData.ldapBindPassword || '',
    ldapBaseDn: defaultData.ldapBaseDn || '',
    ldapUserFilter: defaultData.ldapUserFilter || '',
    ldapNameAttribute: defaultData.ldapNameAttribute || '',
    ldapEmailAttribute: defaultData.ldapEmailAttribute || '',
    ldapUsernameAttribute: defaultData.ldapUsernameAttribute || '',
    ldapRolesAttribute: defaultData.ldapRolesAttribute || '',
    ldapAdminRoles: (defaultData.ldapAdminRoles || []).join(', '),
    ldapProjectOwnerRoles: (defaultData.ldapProjectOwnerRoles || []).join(', '),
    ldapBoardUserRoles: (defaultData.ldapBoardUserRoles || []).join(', '),
    ldapSshTunnelEnabled: !!defaultData.ldapSshTunnelEnabled,
    ldapSshHost: defaultData.ldapSshHost || '',
    ldapSshPort:
      defaultData.ldapSshPort === null || defaultData.ldapSshPort === undefined
        ? ''
        : `${defaultData.ldapSshPort}`,
    ldapSshUsername: defaultData.ldapSshUsername || '',
    ldapSshPassword: defaultData.ldapSshPassword || '',
    ldapSshRemoteHost: defaultData.ldapSshRemoteHost || '',
    ldapSshRemotePort:
      defaultData.ldapSshRemotePort === null || defaultData.ldapSshRemotePort === undefined
        ? ''
        : `${defaultData.ldapSshRemotePort}`,
    ldapSshHostKeyFingerprint: defaultData.ldapSshHostKeyFingerprint || '',
  }));

  const isBindPasswordSet = defaultData.ldapBindPassword === undefined;
  const isSshPasswordSet = defaultData.ldapSshPassword === undefined;

  const cleanData = useMemo(
    () => ({
      ...data,
      ldapHost: data.ldapHost.trim() || null,
      ldapPort: parseInt(data.ldapPort, 10) || null,
      ldapBindDn: data.ldapBindDn.trim() || null,
      ldapBindPassword: data.ldapBindPassword || (isBindPasswordSet ? undefined : null),
      ldapBaseDn: data.ldapBaseDn.trim() || null,
      ldapUserFilter: data.ldapUserFilter.trim() || null,
      ldapNameAttribute: data.ldapNameAttribute.trim() || null,
      ldapEmailAttribute: data.ldapEmailAttribute.trim() || null,
      ldapUsernameAttribute: data.ldapUsernameAttribute.trim() || null,
      ldapRolesAttribute: data.ldapRolesAttribute.trim() || null,
      ldapAdminRoles: parseRolesList(data.ldapAdminRoles),
      ldapProjectOwnerRoles: parseRolesList(data.ldapProjectOwnerRoles),
      ldapBoardUserRoles: parseRolesList(data.ldapBoardUserRoles),
      ldapSshHost: data.ldapSshHost.trim() || null,
      ldapSshPort: parseInt(data.ldapSshPort, 10) || null,
      ldapSshUsername: data.ldapSshUsername.trim() || null,
      ldapSshPassword: data.ldapSshPassword || (isSshPasswordSet ? undefined : null),
      ldapSshRemoteHost: data.ldapSshRemoteHost.trim() || null,
      ldapSshRemotePort: parseInt(data.ldapSshRemotePort, 10) || null,
      ldapSshHostKeyFingerprint: data.ldapSshHostKeyFingerprint.trim() || null,
    }),
    [data, isBindPasswordSet, isSshPasswordSet],
  );

  const isModified = useMemo(() => {
    const cleanDataToCheck = omit(cleanData, ['ldapBindPassword', 'ldapSshPassword']);
    const defaultDataToCheck = omit(defaultData, ['ldapBindPassword', 'ldapSshPassword']);

    return (
      !dequal(cleanDataToCheck, defaultDataToCheck) ||
      isBindPasswordTouchedRef.current ||
      isSshPasswordTouchedRef.current
    );
  }, [defaultData, cleanData]);

  const handleSubmit = useCallback(() => {
    isBindPasswordTouchedRef.current = false;
    isSshPasswordTouchedRef.current = false;
    dispatch(entryActions.updateConfig(cleanData));
  }, [dispatch, cleanData]);

  const handleBindPasswordClear = useCallback(() => {
    dispatch(
      entryActions.updateConfig({
        ldapBindPassword: null,
      }),
    );

    bindPasswordFieldRef.current.focus();
  }, [dispatch, bindPasswordFieldRef]);

  const handleSshPasswordClear = useCallback(() => {
    dispatch(
      entryActions.updateConfig({
        ldapSshPassword: null,
      }),
    );

    sshPasswordFieldRef.current.focus();
  }, [dispatch, sshPasswordFieldRef]);

  const handleTestClick = useCallback(() => {
    dispatch(entryActions.testLdapConfig());
  }, [dispatch]);

  const handleBindPasswordChange = useCallback(
    (event, { value, ...props }) => {
      isBindPasswordTouchedRef.current = value !== '';
      handleFieldChange(event, { value, ...props });
    },
    [handleFieldChange],
  );

  const handleSshPasswordChange = useCallback(
    (event, { value, ...props }) => {
      isSshPasswordTouchedRef.current = value !== '';
      handleFieldChange(event, { value, ...props });
    },
    [handleFieldChange],
  );

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Form onSubmit={handleSubmit}>
        <Checkbox
          name="ldapEnabled"
          checked={data.ldapEnabled}
          label={t('common.enableLdapAuthentication')}
          className={styles.checkbox}
          onChange={handleFieldChange}
        />

        <Divider horizontal>
          <Header as="h4">{t('common.ldapServer_title')}</Header>
        </Divider>
        <div className={styles.text}>{t('common.host')}</div>
        <Input
          fluid
          name="ldapHost"
          value={data.ldapHost}
          maxLength={256}
          className={styles.field}
          onChange={handleFieldChange}
        />
        <div className={styles.text}>{t('common.port')}</div>
        <Input
          fluid
          type="number"
          name="ldapPort"
          value={data.ldapPort}
          placeholder="389"
          min={0}
          max={65535}
          step={1}
          className={styles.field}
          onChange={handleFieldChange}
        />
        <Checkbox
          name="ldapTls"
          checked={data.ldapTls}
          label={t('common.useLdaps')}
          className={classNames(styles.field, styles.checkbox)}
          onChange={handleFieldChange}
        />

        <Divider horizontal>
          <Header as="h4">{t('common.ldapServiceAccount_title')}</Header>
        </Divider>
        <div className={styles.text}>{t('common.bindDn')}</div>
        <Input
          fluid
          name="ldapBindDn"
          value={data.ldapBindDn}
          maxLength={256}
          className={styles.field}
          onChange={handleFieldChange}
        />
        <div className={styles.text}>
          {t('common.bindPassword')} (
          {t('common.optional', {
            context: 'inline',
          })}
          )
        </div>
        <Input.Password
          fluid
          ref={handleBindPasswordFieldRef}
          name="ldapBindPassword"
          value={data.ldapBindPassword}
          placeholder={isBindPasswordSet ? t('common.passwordIsSet') : undefined}
          maxLength={256}
          className={styles.field}
          onClear={
            !data.ldapBindPassword && isBindPasswordSet ? handleBindPasswordClear : undefined
          }
          onChange={handleBindPasswordChange}
        />
        <div className={styles.text}>{t('common.baseDn')}</div>
        <Input
          fluid
          name="ldapBaseDn"
          value={data.ldapBaseDn}
          maxLength={256}
          className={styles.field}
          onChange={handleFieldChange}
        />
        <div className={styles.text}>
          {t('common.userFilter')} (
          {t('common.optional', {
            context: 'inline',
          })}
          )
        </div>
        <Input
          fluid
          name="ldapUserFilter"
          value={data.ldapUserFilter}
          placeholder="(uid={{username}})"
          maxLength={512}
          className={styles.field}
          onChange={handleFieldChange}
        />

        <Divider horizontal>
          <Header as="h4">{t('common.ldapAttributeMapping_title')}</Header>
        </Divider>
        <div className={styles.text}>{t('common.nameAttribute')}</div>
        <Input
          fluid
          name="ldapNameAttribute"
          value={data.ldapNameAttribute}
          placeholder="cn"
          maxLength={256}
          className={styles.field}
          onChange={handleFieldChange}
        />
        <div className={styles.text}>{t('common.emailAttribute')}</div>
        <Input
          fluid
          name="ldapEmailAttribute"
          value={data.ldapEmailAttribute}
          placeholder="mail"
          maxLength={256}
          className={styles.field}
          onChange={handleFieldChange}
        />
        <div className={styles.text}>{t('common.usernameAttribute')}</div>
        <Input
          fluid
          name="ldapUsernameAttribute"
          value={data.ldapUsernameAttribute}
          placeholder="uid"
          maxLength={256}
          className={styles.field}
          onChange={handleFieldChange}
        />
        <div className={styles.text}>
          {t('common.rolesAttribute')} (
          {t('common.optional', {
            context: 'inline',
          })}
          )
        </div>
        <Input
          fluid
          name="ldapRolesAttribute"
          value={data.ldapRolesAttribute}
          placeholder="memberOf"
          maxLength={256}
          className={styles.field}
          onChange={handleFieldChange}
        />

        <Divider horizontal>
          <Header as="h4">{t('common.ldapRoleMapping_title')}</Header>
        </Divider>
        <div className={styles.text}>
          {t('common.adminRoles')} (
          {t('common.optional', {
            context: 'inline',
          })}
          )
        </div>
        <Input
          fluid
          name="ldapAdminRoles"
          value={data.ldapAdminRoles}
          className={styles.field}
          onChange={handleFieldChange}
        />
        <div className={styles.text}>
          {t('common.projectOwnerRoles')} (
          {t('common.optional', {
            context: 'inline',
          })}
          )
        </div>
        <Input
          fluid
          name="ldapProjectOwnerRoles"
          value={data.ldapProjectOwnerRoles}
          className={styles.field}
          onChange={handleFieldChange}
        />
        <div className={styles.text}>
          {t('common.boardUserRoles')} (
          {t('common.optional', {
            context: 'inline',
          })}
          )
        </div>
        <Input
          fluid
          name="ldapBoardUserRoles"
          value={data.ldapBoardUserRoles}
          className={styles.field}
          onChange={handleFieldChange}
        />

        <Divider horizontal>
          <Header as="h4">{t('common.ldapSshTunnel_title')}</Header>
        </Divider>
        <Checkbox
          name="ldapSshTunnelEnabled"
          checked={data.ldapSshTunnelEnabled}
          label={t('common.useSshTunnel')}
          className={styles.checkbox}
          onChange={handleFieldChange}
        />
        {data.ldapSshTunnelEnabled && (
          <>
            <div className={styles.text}>{t('common.host')}</div>
            <Input
              fluid
              name="ldapSshHost"
              value={data.ldapSshHost}
              maxLength={256}
              className={styles.field}
              onChange={handleFieldChange}
            />
            <div className={styles.text}>{t('common.port')}</div>
            <Input
              fluid
              type="number"
              name="ldapSshPort"
              value={data.ldapSshPort}
              placeholder="22"
              min={0}
              max={65535}
              step={1}
              className={styles.field}
              onChange={handleFieldChange}
            />
            <div className={styles.text}>{t('common.username')}</div>
            <Input
              fluid
              name="ldapSshUsername"
              value={data.ldapSshUsername}
              maxLength={256}
              className={styles.field}
              onChange={handleFieldChange}
            />
            <div className={styles.text}>
              {t('common.sshPassword')} (
              {t('common.optional', {
                context: 'inline',
              })}
              )
            </div>
            <Input.Password
              fluid
              ref={handleSshPasswordFieldRef}
              name="ldapSshPassword"
              value={data.ldapSshPassword}
              placeholder={isSshPasswordSet ? t('common.passwordIsSet') : undefined}
              maxLength={256}
              className={styles.field}
              onClear={
                !data.ldapSshPassword && isSshPasswordSet ? handleSshPasswordClear : undefined
              }
              onChange={handleSshPasswordChange}
            />
            <div className={styles.text}>{t('common.remoteHost')}</div>
            <Input
              fluid
              name="ldapSshRemoteHost"
              value={data.ldapSshRemoteHost}
              maxLength={256}
              className={styles.field}
              onChange={handleFieldChange}
            />
            <div className={styles.text}>{t('common.remotePort')}</div>
            <Input
              fluid
              type="number"
              name="ldapSshRemotePort"
              value={data.ldapSshRemotePort}
              min={0}
              max={65535}
              step={1}
              className={styles.field}
              onChange={handleFieldChange}
            />
            <div className={styles.text}>{t('common.sshHostKeyFingerprint')}</div>
            <Input
              fluid
              name="ldapSshHostKeyFingerprint"
              value={data.ldapSshHostKeyFingerprint}
              maxLength={256}
              className={styles.field}
              onChange={handleFieldChange}
            />
          </>
        )}

        <div className={styles.controls}>
          <Button positive disabled={!isModified} content={t('action.save')} />
          {config.ldapEnabled && !isModified && (
            <Button
              type="button"
              content={t('action.testConnection')}
              loading={ldapTestState.isLoading}
              disabled={ldapTestState.isLoading}
              onClick={handleTestClick}
            />
          )}
        </div>
      </Form>
      {ldapTestState.logs && (
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
            value={ldapTestState.logs.join('\n')}
            className={styles.testLog}
          />
        </>
      )}
    </Tab.Pane>
  );
});

export default LdapPane;
