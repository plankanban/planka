/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Form, Tab } from 'semantic-ui-react';
import { Input } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm } from '../../../hooks';

import styles from './AppearancePane.module.scss';

const AppearancePane = React.memo(() => {
  const config = useSelector(selectors.selectConfig);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const defaultData = useMemo(
    () => ({
      loginLogoUrl: config.loginLogoUrl,
      loginAppName: config.loginAppName,
      hidePoweredBy: config.hidePoweredBy,
      loginBackgroundUrl: config.loginBackgroundUrl,
      registrationEnabled: config.registrationEnabled,
    }),
    [config],
  );

  const [data, handleFieldChange] = useForm(() => ({
    loginLogoUrl: defaultData.loginLogoUrl || '',
    loginAppName: defaultData.loginAppName || '',
    hidePoweredBy: defaultData.hidePoweredBy || false,
    loginBackgroundUrl: defaultData.loginBackgroundUrl || '',
    registrationEnabled: defaultData.registrationEnabled || false,
  }));

  const cleanData = useMemo(
    () => ({
      loginLogoUrl: data.loginLogoUrl.trim() || null,
      loginAppName: data.loginAppName.trim() || null,
      hidePoweredBy: data.hidePoweredBy,
      loginBackgroundUrl: data.loginBackgroundUrl.trim() || null,
      registrationEnabled: data.registrationEnabled,
    }),
    [data],
  );

  const isModified = useMemo(
    () => !dequal(cleanData, defaultData),
    [defaultData, cleanData],
  );

  const handleSubmit = useCallback(() => {
    dispatch(entryActions.updateConfig(cleanData));
  }, [dispatch, cleanData]);

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Form onSubmit={handleSubmit}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Login Screen Branding</div>

          <div className={styles.text}>App Name</div>
          <Input
            fluid
            name="loginAppName"
            value={data.loginAppName}
            placeholder="PLANKA"
            maxLength={128}
            className={styles.field}
            onChange={handleFieldChange}
          />

          <div className={styles.text}>Logo URL</div>
          <Input
            fluid
            name="loginLogoUrl"
            value={data.loginLogoUrl}
            placeholder="https://example.com/logo.png"
            maxLength={512}
            className={styles.field}
            onChange={handleFieldChange}
          />

          {data.loginLogoUrl && (
            <div className={styles.logoPreview}>
              <img
                src={data.loginLogoUrl}
                alt="Logo preview"
                className={styles.logoPreviewImage}
                onError={(e) => { e.target.style.display = 'none'; }}
                onLoad={(e) => { e.target.style.display = 'block'; }}
              />
            </div>
          )}

          <div className={styles.text}>Background Image URL</div>
          <Input
            fluid
            name="loginBackgroundUrl"
            value={data.loginBackgroundUrl}
            placeholder="https://example.com/background.jpg"
            maxLength={512}
            className={styles.field}
            onChange={handleFieldChange}
          />

          <Checkbox
            name="hidePoweredBy"
            checked={data.hidePoweredBy}
            label='Hide "Powered by PLANKA" on login screen'
            className={styles.checkbox}
            onChange={handleFieldChange}
          />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Registration</div>

          <Checkbox
            name="registrationEnabled"
            checked={data.registrationEnabled}
            label="Allow new user registration"
            className={styles.checkbox}
            onChange={handleFieldChange}
          />
          <div className={styles.hint}>
            When enabled, a registration link will appear on the login page. New users will be created with the Board User role.
          </div>
        </div>

        <Button positive disabled={!isModified} content={t('action.save')} />
      </Form>
    </Tab.Pane>
  );
});

export default AppearancePane;
