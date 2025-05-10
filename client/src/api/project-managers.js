/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const createProjectManager = (projectId, data, headers) =>
  socket.post(`/projects/${projectId}/project-managers`, data, headers);

const deleteProjectManager = (id, headers) =>
  socket.delete(`/project-managers/${id}`, undefined, headers);

export default {
  createProjectManager,
  deleteProjectManager,
};
