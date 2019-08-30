import socket from './socket';

/* Actions */

const createTask = (cardId, data, headers) => socket.post(`/cards/${cardId}/tasks`, data, headers);

const updateTask = (id, data, headers) => socket.patch(`/tasks/${id}`, data, headers);

const deleteTask = (id, headers) => socket.delete(`/tasks/${id}`, undefined, headers);

export default {
  createTask,
  updateTask,
  deleteTask,
};
