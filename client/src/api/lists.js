import socket from './socket';

/* Actions */

const createList = (boardId, data, headers) =>
  socket.post(`/boards/${boardId}/lists`, data, headers);

const updateList = (id, data, headers) => socket.patch(`/lists/${id}`, data, headers);

const deleteList = (id, headers) => socket.delete(`/lists/${id}`, undefined, headers);

export default {
  createList,
  updateList,
  deleteList,
};
