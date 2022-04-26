import http from './http';
import socket from './socket';

/* Actions */

const getUsers = () => socket.get('/users');

const createUser = (data) => socket.post('/users', data);

const getUser = (id) => socket.get(`/users/${id}`);

const getCurrentUser = () => socket.get('/users/me');

const updateUser = (id, data) => socket.patch(`/users/${id}`, data);

const updateUserEmail = (id, data) => socket.patch(`/users/${id}/email`, data);

const updateUserPassword = (id, data) => socket.patch(`/users/${id}/password`, data);

const updateUserUsername = (id, data) => socket.patch(`/users/${id}/username`, data);

const updateUserAvatar = (id, data) => http.post(`/users/${id}/avatar`, data);

const deleteUser = (id) => socket.delete(`/users/${id}`);

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
