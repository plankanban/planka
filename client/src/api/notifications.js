import socket from './socket';
import { transformCard } from './cards';
import { transformAction } from './actions';

/* Actions */

const getNotifications = () =>
  socket.get('/notifications').then((body) => ({
    ...body,
    included: {
      ...body.included,
      cards: body.included.cards.map(transformCard),
      actions: body.included.actions.map(transformAction),
    },
  }));

const getNotification = (id) =>
  socket.get(`/notifications/${id}`).then((body) => ({
    ...body,
    included: {
      ...body.included,
      cards: body.included.cards.map(transformCard),
      actions: body.included.actions.map(transformAction),
    },
  }));

const updateNotifications = (ids, data) => socket.patch(`/notifications/${ids.join(',')}`, data);

export default {
  getNotifications,
  getNotification,
  updateNotifications,
};
