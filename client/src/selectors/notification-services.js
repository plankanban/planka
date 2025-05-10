/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { isLocalId } from '../utils/local-id';

export const makeSelectNotificationServiceById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ NotificationService }, id) => {
      const notificationServiceModel = NotificationService.withId(id);

      if (!notificationServiceModel) {
        return notificationServiceModel;
      }

      return {
        ...notificationServiceModel.ref,
        isPersisted: !isLocalId(notificationServiceModel.id),
      };
    },
  );

export const selectNotificationServiceById = makeSelectNotificationServiceById();

export default {
  makeSelectNotificationServiceById,
  selectNotificationServiceById,
};
