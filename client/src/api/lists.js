import socket from './socket';

/* Actions */

const createList = (boardId, data) => socket.post(`/boards/${boardId}/lists`, data);

const updateList = (id, data) => socket.patch(`/lists/${id}`, data);

const deleteList = (id) => socket.delete(`/lists/${id}`);

export default {
  createList,
  updateList,
  deleteList,
};
