import socket from './socket';

/* Transformers */

export const transformProjectManager = (projectManager) => ({
  ...projectManager,
  createdAt: new Date(projectManager.createdAt),
});

/* Actions */

const createProjectManager = (projectId, data, headers) =>
  socket.post(`/projects/${projectId}/managers`, data, headers).then((body) => ({
    ...body,
    item: transformProjectManager(body.item),
  }));

const deleteProjectManager = (id, headers) =>
  socket.delete(`/project-managers/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformProjectManager(body.item),
  }));

/* Event handlers */

const makeHandleProjectManagerCreate = (next) => (body) => {
  next({
    ...body,
    item: transformProjectManager(body.item),
  });
};

const makeHandleProjectManagerDelete = makeHandleProjectManagerCreate;

export default {
  createProjectManager,
  deleteProjectManager,
  makeHandleProjectManagerCreate,
  makeHandleProjectManagerDelete,
};
