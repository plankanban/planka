import socket from './socket';

/* Actions */

const createProjectManager = (projectId, data) =>
  socket.post(`/projects/${projectId}/managers`, data);

const deleteProjectManager = (id) => socket.delete(`/project-managers/${id}`);

export default {
  createProjectManager,
  deleteProjectManager,
};
