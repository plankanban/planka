/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeSelectNotificationById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Notification }, id) => {
      const notificationModel = Notification.withId(id);

      if (!notificationModel) {
        return notificationModel;
      }

      return notificationModel.ref;
    },
  );

export const selectNotificationById = makeSelectNotificationById();

export const makeSelectNotificationIdsByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Notification }, id) =>
      Notification.filter({
        cardId: id,
      })
        .toRefArray()
        .map((notification) => notification.id),
  );

export const selectNotificationIdsByCardId = makeSelectNotificationIdsByCardId();

export default {
  makeSelectNotificationById,
  selectNotificationById,
  makeSelectNotificationIdsByCardId,
  selectNotificationIdsByCardId,
};
