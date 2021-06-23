import socket from './socket';
import { transformCard } from './cards';
import { transformAction } from './actions';

/* Actions */

const getNotifications = (headers) =>
  socket.get('/notifications', undefined, headers).then((body) => ({
    ...body,
    included: {
      ...body.included,
      cards: body.included.cards.map(transformCard),
      actions: body.included.actions.map(transformAction),
    },
  }));

const getNotification = (id, headers) =>
  socket.get(`/notifications/${id}`, undefined, headers).then((body) => ({
    ...body,
    included: {
      ...body.included,
      cards: body.included.cards.map(transformCard),
      actions: body.included.actions.map(transformAction),
    },
  }));

const updateNotifications = (ids, data, headers) =>
  socket.patch(`/notifications/${ids.join(',')}`, data, headers);

export default {
  getNotifications,
  getNotification,
  updateNotifications,
};
