/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { isLocalId } from '../utils/local-id';

export const makeSelectWebhookById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Webhook }, id) => {
      const webhookModel = Webhook.withId(id);

      if (!webhookModel) {
        return webhookModel;
      }

      return {
        ...webhookModel.ref,
        isPersisted: !isLocalId(webhookModel.id),
      };
    },
  );

export const selectWebhookById = makeSelectWebhookById();

export const selectWebhookIds = createSelector(orm, ({ Webhook }) =>
  Webhook.getAllQuerySet()
    .toRefArray()
    .map((webhook) => webhook.id),
);

export default {
  makeSelectWebhookById,
  selectWebhookById,
  selectWebhookIds,
};
