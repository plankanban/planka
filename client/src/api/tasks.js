import socket from './socket';

/* Actions */

const createTask = (cardId, data) => socket.post(`/cards/${cardId}/tasks`, data);

const updateTask = (id, data) => socket.patch(`/tasks/${id}`, data);

const deleteTask = (id) => socket.delete(`/tasks/${id}`);

export default {
  createTask,
  updateTask,
  deleteTask,
};
