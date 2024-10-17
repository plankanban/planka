import socket from './socket';
import { transformUser } from './users';

/* Transformers */

export const transformActivity = (activity) => ({
  ...activity,
  createdAt: new Date(activity.createdAt),
});

/* Actions */

const getActivities = (cardId, data, headers) =>
  socket.get(`/cards/${cardId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
    included: {
      ...body.included,
      users: body.included.users.map(transformUser),
    },
  }));

/* Event handlers */

const makeHandleActivityCreate = (next) => (body) => {
  next({
    ...body,
    item: transformActivity(body.item),
  });
};

const makeHandleActivityUpdate = makeHandleActivityCreate;

const makeHandleActivityDelete = makeHandleActivityCreate;

export default {
  getActivities,
  makeHandleActivityCreate,
  makeHandleActivityUpdate,
  makeHandleActivityDelete,
};
