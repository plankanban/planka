import http from './http';
import socket from './socket';

/* Actions */

const getProjects = (headers) => socket.get('/projects', undefined, headers);

const createProject = (data, headers) => socket.post('/projects', data, headers);

const updateProject = (id, data, headers) => socket.patch(`/projects/${id}`, data, headers);

const importProject = (data, headers) => http.post(`/projects/import`, data, headers);

const updateProjectBackgroundImage = (id, data, headers) =>
  http.post(`/projects/${id}/background-image`, data, headers);

const deleteProject = (id, headers) => socket.delete(`/projects/${id}`, undefined, headers);

export default {
  getProjects,
  createProject,
  updateProject,
  updateProjectBackgroundImage,
  deleteProject,
  importProject,
};
