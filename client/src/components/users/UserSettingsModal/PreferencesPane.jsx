/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Radio, Tab } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';

import styles from './PreferencesPane.module.scss';

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
    </Tab.Pane>
  );
});

export default PreferencesPane;
