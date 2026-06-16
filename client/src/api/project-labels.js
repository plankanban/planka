/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const createProjectLabel = (projectId, data, headers) =>
  socket.post(`/projects/${projectId}/project-labels`, data, headers);

const updateProjectLabel = (id, data, headers) =>
  socket.patch(`/project-labels/${id}`, data, headers);

const deleteProjectLabel = (id, headers) =>
  socket.delete(`/project-labels/${id}`, undefined, headers);

export default {
  createProjectLabel,
  updateProjectLabel,
  deleteProjectLabel,
};
