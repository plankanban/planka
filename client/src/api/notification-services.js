/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const createNotificationServiceInUser = (userId, data, headers) =>
  socket.post(`/users/${userId}/notification-services`, data, headers);

const createNotificationServiceInBoard = (boardId, data, headers) =>
  socket.post(`/boards/${boardId}/notification-services`, data, headers);

const updateNotificationService = (id, data, headers) =>
  socket.patch(`/notification-services/${id}`, data, headers);

const testNotificationService = (id, headers) =>
  socket.post(`/notification-services/${id}/test`, undefined, headers);

const deleteNotificationService = (id, headers) =>
  socket.delete(`/notification-services/${id}`, undefined, headers);

export default {
  createNotificationServiceInUser,
  createNotificationServiceInBoard,
  updateNotificationService,
  testNotificationService,
  deleteNotificationService,
};
