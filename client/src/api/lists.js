import socket from './socket';
import { transformCard } from './cards';

/* Actions */

const createList = (boardId, data, headers) =>
  socket.post(`/boards/${boardId}/lists`, data, headers);

const updateList = (id, data, headers) => socket.patch(`/lists/${id}`, data, headers);

const sortList = (id, data, headers) =>
  socket.post(`/lists/${id}/sort`, data, headers).then((body) => ({
    ...body,
    included: {
      ...body.included,
      cards: body.included.cards.map(transformCard),
    },
  }));

const deleteList = (id, headers) => socket.delete(`/lists/${id}`, undefined, headers);

/* Event handlers */

const makeHandleListSort = (next) => (body) => {
  next({
    ...body,
    included: {
      ...body.included,
      cards: body.included.cards.map(transformCard),
    },
  });
};

export default {
  createList,
  updateList,
  sortList,
  deleteList,
  makeHandleListSort,
};
