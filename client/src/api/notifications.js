import omit from 'lodash/omit';

import socket from './socket';
import { transformUser } from './users';
import { transformCard } from './cards';
import { transformActivity } from './activities';

/* Transformers */

export const transformNotification = (notification) => ({
  ...omit(notification, 'actionId'),
  activityId: notification.actionId,
});

/* Actions */

const getNotifications = (headers) =>
  socket.get('/notifications', undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformNotification),
    included: {
      ...omit(body.included, 'actions'),
      users: body.included.users.map(transformUser),
      cards: body.included.cards.map(transformCard),
      activities: body.included.actions.map(transformActivity),
    },
  }));

const getNotification = (id, headers) =>
  socket.get(`/notifications/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformNotification(body.item),
    included: {
      ...omit(body.included, 'actions'),
      users: body.included.users.map(transformUser),
      cards: body.included.cards.map(transformCard),
      activities: body.included.actions.map(transformActivity),
    },
  }));

const updateNotifications = (ids, data, headers) =>
  socket.patch(`/notifications/${ids.join(',')}`, data, headers).then((body) => ({
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
  getNotification,
  updateNotifications,
  makeHandleNotificationCreate,
  makeHandleNotificationUpdate,
};
