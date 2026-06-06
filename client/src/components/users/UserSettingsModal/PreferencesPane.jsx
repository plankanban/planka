/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dropdown, Radio, Tab } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { DueDateColorSchemes } from '../../../constants/Enums';

import styles from './PreferencesPane.module.scss';

const DUE_DATE_COLOR_SCHEME_OPTIONS = [
  DueDateColorSchemes.DEFAULT,
  DueDateColorSchemes.BLUE_ORANGE,
];

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

  const handleDueDateColorSchemeChange = useCallback(
    (_, { value }) => {
      dispatch(
        entryActions.updateCurrentUser({
          dueDateColorScheme: value,
        }),
      );
    },
    [dispatch],
  );

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
        <div className={styles.label}>{t('common.dueDateColorScheme')}</div>
        <Dropdown
          fluid
          selection
          options={DUE_DATE_COLOR_SCHEME_OPTIONS.map((value) => ({
            value,
            text: t(`common.dueDateColorScheme_${value}`),
          }))}
          value={user.dueDateColorScheme}
          onChange={handleDueDateColorSchemeChange}
        />
      </div>
    </Tab.Pane>
  );
});

export default PreferencesPane;
