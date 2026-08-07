/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dropdown, Radio, Tab } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { AutoLogoutModes } from '../../../constants/Enums';

import styles from './PreferencesPane.module.scss';

const AUTO_LOGOUT_OPTION_ORDER = [
  AutoLogoutModes.MINUTES_2,
  AutoLogoutModes.MINUTES_5,
  AutoLogoutModes.MINUTES_10,
  AutoLogoutModes.MINUTES_30,
  AutoLogoutModes.HOURS_12,
  AutoLogoutModes.NEVER,
];

const AUTO_LOGOUT_TRANSLATION_KEYS = {
  [AutoLogoutModes.NEVER]: 'common.autoLogout_never',
  [AutoLogoutModes.MINUTES_2]: 'common.autoLogout_2m',
  [AutoLogoutModes.MINUTES_5]: 'common.autoLogout_5m',
  [AutoLogoutModes.MINUTES_10]: 'common.autoLogout_10m',
  [AutoLogoutModes.MINUTES_30]: 'common.autoLogout_30m',
  [AutoLogoutModes.HOURS_12]: 'common.autoLogout_12h',
};

const PreferencesPane = React.memo(() => {
  const user = useSelector(selectors.selectCurrentUser);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleChange = useCallback(
    (_, { name: fieldName, checked }) => {
      dispatch(
        entryActions.updateCurrentUser({
          [fieldName]: checked,
        }),
      );
    },
    [dispatch],
  );

  const handleAutoLogoutChange = useCallback(
    (_, { value }) => {
      dispatch(
        entryActions.updateCurrentUser({
          autoLogoutMode: value,
        }),
      );
    },
    [dispatch],
  );

  const autoLogoutOptions = useMemo(
    () =>
      AUTO_LOGOUT_OPTION_ORDER.map((mode) => ({
        key: mode,
        value: mode,
        text: t(AUTO_LOGOUT_TRANSLATION_KEYS[mode]),
      })),
    [t],
  );

  const autoLogoutValue = user.autoLogoutMode || AutoLogoutModes.MINUTES_30;

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Radio
        toggle
        name="subscribeToOwnCards"
        checked={user.subscribeToOwnCards}
        label={t('common.subscribeToMyOwnCardsByDefault')}
        className={styles.radio}
        onChange={handleChange}
      />
      <Radio
        toggle
        name="subscribeToCardWhenCommenting"
        checked={user.subscribeToCardWhenCommenting}
        label={t('common.subscribeToCardWhenCommenting')}
        className={styles.radio}
        onChange={handleChange}
      />
      <Radio
        toggle
        name="turnOffRecentCardHighlighting"
        checked={user.turnOffRecentCardHighlighting}
        label={t('common.turnOffRecentCardHighlighting')}
        className={styles.radio}
        onChange={handleChange}
      />
      <div className={styles.field}>
        <span className={styles.label}>{t('common.autoLogout')}</span>
        <Dropdown
          fluid
          selection
          className={styles.dropdown}
          options={autoLogoutOptions}
          value={autoLogoutValue}
          onChange={handleAutoLogoutChange}
        />
      </div>
    </Tab.Pane>
  );
});

export default PreferencesPane;
