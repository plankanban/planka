/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const createBaseCustomFieldGroup = (projectId, data, headers) =>
  socket.post(`/projects/${projectId}/base-custom-field-groups`, data, headers);

const updateBaseCustomFieldGroup = (id, data, headers) =>
  socket.patch(`/base-custom-field-groups/${id}`, data, headers);

const deleteBaseCustomFieldGroup = (id, headers) =>
  socket.delete(`/base-custom-field-groups/${id}`, undefined, headers);

export default {
  createBaseCustomFieldGroup,
  updateBaseCustomFieldGroup,
  deleteBaseCustomFieldGroup,
};
