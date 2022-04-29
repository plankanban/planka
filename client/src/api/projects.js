import http from './http';
import socket from './socket';

/* Actions */

const getProjects = () => socket.get('/projects');

const createProject = (data) => socket.post('/projects', data);

const getProject = (id) => socket.get(`/projects/${id}`);

const updateProject = (id, data) => socket.patch(`/projects/${id}`, data);

const updateProjectBackgroundImage = (id, data) =>
  http.post(`/projects/${id}/background-image`, data);

const deleteProject = (id) => socket.delete(`/projects/${id}`);

export default {
  getProjects,
  createProject,
  getProject,
  updateProject,
  updateProjectBackgroundImage,
  deleteProject,
};
