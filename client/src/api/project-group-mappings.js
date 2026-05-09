/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const getProjectGroupMappings = (headers) =>
  socket.get('/project-group-mappings', undefined, headers);

const createProjectGroupMapping = (data, headers) =>
  socket.post('/project-group-mappings', data, headers);

const deleteProjectGroupMapping = (id, headers) =>
  socket.delete(`/project-group-mappings/${id}`, undefined, headers);

export default {
  getProjectGroupMappings,
  createProjectGroupMapping,
  deleteProjectGroupMapping,
};
