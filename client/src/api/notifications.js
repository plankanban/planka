/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import omit from 'lodash/omit';

import socket from './socket';

/* Transformers */

export const transformNotification = (notification) => ({
  ...(notification.actionId
    ? {
        ...omit(notification, 'actionId'),
        activityId: notification.actionId,
      }
    : notification),
  ...(notification.createdAt && {
    createdAt: new Date(notification.createdAt),
  }),
});

/* Actions */

const getNotifications = (headers) =>
  socket.get('/notifications', undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformNotification),
  }));

/* const getNotification = (id, headers) =>
  socket.get(`/notifications/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformNotification(body.item),
    included: {
      users: body.included.users.map(transformUser),
    },
  })); */

const updateNotification = (id, data, headers) =>
  socket.patch(`/notifications/${id}`, data, headers).then((body) => ({
    ...body,
    item: transformNotification(body.item),
  }));

const readAllNotifications = (headers) =>
  socket.post('/notifications/read-all', undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformNotification),
  }));

/* Event handlers */

const makeHandleNotificationCreate = (next) => (body) => {
  next({
    ...body,
    item: transformNotification(body.item),
  });
};

const makeHandleNotificationUpdate = makeHandleNotificationCreate;

export default {
  getNotifications,
  // getNotification,
  updateNotification,
  readAllNotifications,
  makeHandleNotificationCreate,
  makeHandleNotificationUpdate,
};
