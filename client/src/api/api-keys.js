/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const createApiKey = (userId, headers) =>
  socket.post(`/users/${userId}/api-key`, undefined, headers);

const cycleApiKey = (userId, headers) =>
  socket.patch(`/users/${userId}/api-key`, undefined, headers);

const deleteApiKey = (userId, headers) =>
  socket.delete(`/users/${userId}/api-key`, undefined, headers);

export default {
  createApiKey,
  cycleApiKey,
  deleteApiKey,
};
