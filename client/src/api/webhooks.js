/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const getWebhooks = (headers) => socket.get('/webhooks', undefined, headers);

const createWebhook = (data, headers) => socket.post('/webhooks', data, headers);

const updateWebhook = (id, data, headers) => socket.patch(`/webhooks/${id}`, data, headers);

const deleteWebhook = (id, headers) => socket.delete(`/webhooks/${id}`, undefined, headers);

export default {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
};
