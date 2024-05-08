import http from './http';
import socket from './socket';
import { transformUser } from './users';
import { transformProjectManager } from './project-managers';
import { transformBoardMembership } from './board-memberships';

/* Actions */

const getProjects = (headers) =>
  socket.get('/projects', undefined, headers).then((body) => ({
    ...body,
    included: {
      ...body.included,
      users: body.included.users.map(transformUser),
      projectManagers: body.included.projectManagers.map(transformProjectManager),
      boardMemberships: body.included.boardMemberships.map(transformBoardMembership),
    },
  }));

const createProject = (data, headers) =>
  socket.post('/projects', data, headers).then((body) => ({
    ...body,
    included: {
      ...body.included,
      projectManagers: body.included.projectManagers.map(transformProjectManager),
    },
  }));

const getProject = (id, headers) =>
  socket.get(`/projects/${id}`, undefined, headers).then((body) => ({
    ...body,
    included: {
      ...body.included,
      users: body.included.users.map(transformUser),
      projectManagers: body.included.projectManagers.map(transformProjectManager),
      boardMemberships: body.included.boardMemberships.map(transformBoardMembership),
    },
  }));

const updateProject = (id, data, headers) => socket.patch(`/projects/${id}`, data, headers);

const updateProjectBackgroundImage = (id, data, headers) =>
  http.post(`/projects/${id}/background-image`, data, headers);

const deleteProject = (id, headers) => socket.delete(`/projects/${id}`, undefined, headers);

export default {
  getProjects,
  createProject,
  getProject,
  updateProject,
  updateProjectBackgroundImage,
  deleteProject,
};
