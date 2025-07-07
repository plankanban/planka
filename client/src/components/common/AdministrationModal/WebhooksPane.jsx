/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tab } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import Webhooks from '../../webhooks/Webhooks';

import styles from './WebhooksPane.module.scss';

const WebhooksPane = React.memo(() => {
  const webhookIds = useSelector(selectors.selectWebhookIds);

  const dispatch = useDispatch();

  const handleCreate = useCallback(
    (data) => {
      dispatch(entryActions.createWebhook(data));
    },
    [dispatch],
  );

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Webhooks ids={webhookIds} onCreate={handleCreate} />
    </Tab.Pane>
  );
});

export default WebhooksPane;
