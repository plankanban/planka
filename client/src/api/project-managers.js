import socket from './socket';

/* Actions */

const createProjectManager = (projectId, data, headers) =>
  socket.post(`/projects/${projectId}/managers`, data, headers);

const deleteProjectManager = (id, headers) =>
  socket.delete(`/project-managers/${id}`, undefined, headers);

export default {
  createProjectManager,
  deleteProjectManager,
};
