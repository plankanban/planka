/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import http from './http';
import socket from './socket';

/* Actions */

const getUsers = (headers) => socket.get('/users', undefined, headers);

const createUser = (data, headers) => socket.post('/users', data, headers);

/* const getUser = (id, headers) =>
  socket.get(`/users/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  })); */

const getCurrentUser = (subscribe, headers) =>
  socket.get(`/users/me${subscribe ? '?subscribe=true' : ''}`, undefined, headers);

const updateUser = (id, data, headers) => socket.patch(`/users/${id}`, data, headers);

const updateUserEmail = (id, data, headers) => socket.patch(`/users/${id}/email`, data, headers);

const updateUserPassword = (id, data, headers) =>
  socket.patch(`/users/${id}/password`, data, headers);

const updateUserUsername = (id, data, headers) =>
  socket.patch(`/users/${id}/username`, data, headers);

const updateUserAvatar = (id, data, headers) => http.post(`/users/${id}/avatar`, data, headers);

const createUserApiKey = (userId, headers) =>
  socket.post(`/users/${userId}/api-key`, undefined, headers);

const setupUserTotp = (id, data, headers) => socket.post(`/users/${id}/totp/setup`, data, headers);

const enableUserTotp = (id, data, headers) =>
  socket.post(`/users/${id}/totp/enable`, data, headers);

const disableUserTotp = (id, data, headers) => socket.delete(`/users/${id}/totp`, data, headers);

const regenerateUserTotpRecoveryCodes = (id, data, headers) =>
  socket.post(`/users/${id}/totp/recovery-codes`, data, headers);

const getUserTrustedDevices = (id, headers) =>
  socket.get(`/users/${id}/trusted-devices`, undefined, headers);

const deleteUserTrustedDevice = (id, deviceId, headers) =>
  socket.delete(`/users/${id}/trusted-devices/${deviceId}`, undefined, headers);

const deleteUser = (id, headers) => socket.delete(`/users/${id}`, undefined, headers);

export default {
  getUsers,
  createUser,
  // getUser,
  getCurrentUser,
  updateUser,
  updateUserEmail,
  updateUserPassword,
  updateUserUsername,
  updateUserAvatar,
  createUserApiKey,
  setupUserTotp,
  enableUserTotp,
  disableUserTotp,
  regenerateUserTotpRecoveryCodes,
  getUserTrustedDevices,
  deleteUserTrustedDevice,
  deleteUser,
};
