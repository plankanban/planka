import http from './http';
import socket from './socket';

/* Actions */

const getUsers = (headers) => socket.get('/users', undefined, headers);

const createUser = (data, headers) => socket.post('/users', data, headers);

const getUser = (id, headers) => socket.get(`/users/${id}`, undefined, headers);

const getCurrentUser = (headers) => socket.get('/users/me', undefined, headers);

const updateUser = (id, data, headers) => socket.patch(`/users/${id}`, data, headers);

const updateUserEmail = (id, data, headers) => socket.patch(`/users/${id}/email`, data, headers);

const updateUserPassword = (id, data, headers) =>
  socket.patch(`/users/${id}/password`, data, headers);

const updateUserUsername = (id, data, headers) =>
  socket.patch(`/users/${id}/username`, data, headers);

const updateUserAvatar = (id, data, headers) => http.post(`/users/${id}/avatar`, data, headers);

const deleteUser = (id, headers) => socket.delete(`/users/${id}`, undefined, headers);

export default {
  getUsers,
  createUser,
  getUser,
  getCurrentUser,
  updateUser,
  updateUserEmail,
  updateUserPassword,
  updateUserUsername,
  updateUserAvatar,
  deleteUser,
};
