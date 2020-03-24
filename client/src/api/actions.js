import socket from './socket';

/* Transformers */

export const transformAction = (action) => ({
  ...action,
  createdAt: new Date(action.createdAt),
});

/* Actions */

const getActions = (cardId, data, headers) =>
  socket.get(`/cards/${cardId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformAction),
  }));

/* Event handlers */

const makeHandleActionCreate = (next) => (body) => {
  next({
    ...body,
    item: transformAction(body.item),
  });
};

const makeHandleActionUpdate = makeHandleActionCreate;

const makeHandleActionDelete = makeHandleActionCreate;

export default {
  getActions,
  makeHandleActionCreate,
  makeHandleActionUpdate,
  makeHandleActionDelete,
};
