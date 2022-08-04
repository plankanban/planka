import omit from 'lodash/omit';

import socket from './socket';
import { transformCard } from './cards';
import { transformActivity } from './activities';

/* Transformers */

export const transformNotification = (notification) => ({
  ...omit(notification, 'actionId'),
  activityId: notification.actionId,
});

/* Actions */

const getNotifications = () =>
  socket.get('/notifications').then((body) => ({
    ...body,
    items: body.items.map(transformNotification),
    included: {
      ...omit(body.included, 'actions'),
      cards: body.included.cards.map(transformCard),
      activities: body.included.actions.map(transformActivity),
    },
  }));

const getNotification = (id) =>
  socket.get(`/notifications/${id}`).then((body) => ({
    ...body,
    item: transformNotification(body.item),
    included: {
      ...omit(body.included, 'actions'),
      cards: body.included.cards.map(transformCard),
      activities: body.included.actions.map(transformActivity),
    },
  }));

const updateNotifications = (ids, data) =>
  socket.patch(`/notifications/${ids.join(',')}`, data).then((body) => ({
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
