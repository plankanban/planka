/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tab } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import NotificationServices from '../../notification-services/NotificationServices';

import styles from './NotificationsPane.module.scss';

const NotificationsPane = React.memo(() => {
  const notificationServiceIds = useSelector(selectors.selectNotificationServiceIdsForCurrentUser);

  const dispatch = useDispatch();

  const handleCreate = useCallback(
    (data) => {
      dispatch(entryActions.createNotificationServiceInCurrentUser(data));
    },
    [dispatch],
  );

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <NotificationServices ids={notificationServiceIds} onCreate={handleCreate} />
    </Tab.Pane>
  );
});

export default NotificationsPane;
