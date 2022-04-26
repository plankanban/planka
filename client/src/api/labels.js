import socket from './socket';

/* Actions */

const createLabel = (boardId, data) => socket.post(`/boards/${boardId}/labels`, data);

const updateLabel = (id, data) => socket.patch(`/labels/${id}`, data);

const deleteLabel = (id) => socket.delete(`/labels/${id}`);

export default {
  createLabel,
  updateLabel,
  deleteLabel,
};
