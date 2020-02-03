import socket from './socket';

/* Actions */

const createProjectMembership = (projectId, data, headers) =>
  socket.post(`/projects/${projectId}/memberships`, data, headers);

const deleteProjectMembership = (id, headers) =>
  socket.delete(`/project-memberships/${id}`, undefined, headers);

export default {
  createProjectMembership,
  deleteProjectMembership,
};
