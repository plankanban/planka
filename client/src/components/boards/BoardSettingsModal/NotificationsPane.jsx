/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tab } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import NotificationServices from '../../notification-services/NotificationServices';

import styles from './NotificationsPane.module.scss';

const NotificationsPane = React.memo(() => {
  const selectNotificationServiceIdsByBoardId = useMemo(
    () => selectors.makeSelectNotificationServiceIdsByBoardId(),
    [],
  );

  const boardId = useSelector((state) => selectors.selectCurrentModal(state).params.id);

  const notificationServiceIds = useSelector((state) =>
    selectNotificationServiceIdsByBoardId(state, boardId),
  );

  const dispatch = useDispatch();

  const handleCreate = useCallback(
    (data) => {
      dispatch(entryActions.createNotificationServiceInBoard(boardId, data));
    },
    [boardId, dispatch],
  );

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <NotificationServices ids={notificationServiceIds} onCreate={handleCreate} />
    </Tab.Pane>
  );
});

export default NotificationsPane;
