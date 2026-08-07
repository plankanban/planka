/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Header, Icon, List, Loader, Message } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';

import styles from './TrustedDevicesSection.module.scss';

const formatLastUsed = (iso, t) => {
  if (!iso) return t('common.never');
  return new Date(iso).toLocaleString();
};

const ICON_BY_DEVICE_TYPE = {
  mobile: 'mobile alternate',
  tablet: 'tablet alternate',
  smarttv: 'tv',
  wearable: 'heartbeat',
  console: 'gamepad',
};

const getDeviceIcon = (device) => ICON_BY_DEVICE_TYPE[device.deviceType] || 'desktop';

const buildPrimaryLabel = (device, t) => {
  if (device.label) return device.label;

  // Mobile / tablet: vendor + model is usually the most recognizable ("Apple iPhone")
  if (device.deviceVendor || device.deviceModel) {
    const joined = [device.deviceVendor, device.deviceModel].filter(Boolean).join(' ');
    if (joined) return joined;
  }

  // Desktop fallback: OS line
  const osPart = [device.osName, device.osVersion].filter(Boolean).join(' ');
  if (osPart) return osPart;

  if (device.userAgentSummary) return device.userAgentSummary;
  return t('common.unknownDevice');
};

const buildSecondaryLabel = (device) => {
  const parts = [];
  const hasMobileLabel = !!(device.deviceVendor || device.deviceModel);

  // If we already showed OS as the primary label (desktop fallback), don't repeat it.
  if (hasMobileLabel && (device.osName || device.osVersion)) {
    parts.push([device.osName, device.osVersion].filter(Boolean).join(' '));
  }

  if (device.browserName) {
    parts.push([device.browserName, device.browserVersion].filter(Boolean).join(' '));
  }

  return parts.filter(Boolean).join(' · ');
};

const TrustedDevicesSection = React.memo(() => {
  const { items, isFetching, isFetched, deletingIds } = useSelector(
    selectors.selectUserTrustedDevicesState,
  );

  const dispatch = useDispatch();
  const [t] = useTranslation();

  useEffect(() => {
    dispatch(entryActions.fetchCurrentUserTrustedDevices());
  }, [dispatch]);

  const handleRevokeClick = useCallback(
    (deviceId) => {
      dispatch(entryActions.deleteCurrentUserTrustedDevice(deviceId));
    },
    [dispatch],
  );

  return (
    <div className={styles.wrapper}>
      <Header as="h4" className={styles.heading}>
        {t('common.trustedDevices_title')}
      </Header>
      <p className={styles.hint}>{t('common.trustedDevicesHint')}</p>

      {!isFetched && isFetching && <Loader active inline="centered" size="small" />}

      {isFetched && items.length === 0 && <Message info content={t('common.noTrustedDevices')} />}

      {items.length > 0 && (
        <List divided relaxed className={styles.list}>
          {items.map((device) => {
            const isDeleting = deletingIds.includes(device.id);
            const primary = buildPrimaryLabel(device, t);
            const secondary = buildSecondaryLabel(device);
            return (
              <List.Item key={device.id}>
                <List.Content floated="right">
                  <Button
                    basic
                    size="tiny"
                    icon="trash"
                    content={t('action.revoke')}
                    loading={isDeleting}
                    disabled={isDeleting}
                    onClick={() => handleRevokeClick(device.id)}
                  />
                </List.Content>
                <List.Content>
                  <List.Header className={styles.deviceHeader}>
                    <Icon name={getDeviceIcon(device)} />
                    <span className={styles.devicePrimary}>{primary}</span>
                  </List.Header>
                  {secondary && (
                    <List.Description className={styles.deviceSecondary}>
                      {secondary}
                    </List.Description>
                  )}
                  <List.Description className={styles.meta}>
                    <span>
                      {t('common.lastUsed')}: {formatLastUsed(device.lastUsedAt, t)}
                    </span>
                    {' · '}
                    <span>
                      {t('common.expires')}: {new Date(device.expiresAt).toLocaleDateString()}
                    </span>
                  </List.Description>
                </List.Content>
              </List.Item>
            );
          })}
        </List>
      )}
    </div>
  );
});

export default TrustedDevicesSection;
