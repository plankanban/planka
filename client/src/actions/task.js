import ActionTypes from '../constants/ActionTypes';

/* Actions */

export const createTask = (task) => ({
  type: ActionTypes.TASK_CREATE,
  payload: {
    task,
  },
});

export const updateTask = (id, data) => ({
  type: ActionTypes.TASK_UPDATE,
  payload: {
    id,
    data,
  },
});

export const deleteTask = (id) => ({
  type: ActionTypes.TASK_DELETE,
  payload: {
    id,
  },
});

/* Events */

export const createTaskRequested = (localId, data) => ({
  type: ActionTypes.TASK_CREATE_REQUESTED,
  payload: {
    localId,
    data,
  },
});

export const createTaskSucceeded = (localId, task) => ({
  type: ActionTypes.TASK_CREATE_SUCCEEDED,
  payload: {
    localId,
    task,
  },
});

export const createTaskFailed = (localId, error) => ({
  type: ActionTypes.TASK_CREATE_FAILED,
  payload: {
    localId,
    error,
  },
});

export const createTaskReceived = (task) => ({
  type: ActionTypes.TASK_CREATE_RECEIVED,
  payload: {
    task,
  },
});

export const updateTaskRequested = (id, data) => ({
  type: ActionTypes.TASK_UPDATE_REQUESTED,
  payload: {
    id,
    data,
  },
});

export const updateTaskSucceeded = (task) => ({
  type: ActionTypes.TASK_UPDATE_SUCCEEDED,
  payload: {
    task,
  },
});

export const updateTaskFailed = (id, error) => ({
  type: ActionTypes.TASK_UPDATE_FAILED,
  payload: {
    id,
    error,
  },
});

export const updateTaskReceived = (task) => ({
  type: ActionTypes.TASK_UPDATE_RECEIVED,
  payload: {
    task,
  },
});

export const deleteTaskRequested = (id) => ({
  type: ActionTypes.TASK_DELETE_REQUESTED,
  payload: {
    id,
  },
});

export const deleteTaskSucceeded = (task) => ({
  type: ActionTypes.TASK_DELETE_SUCCEEDED,
  payload: {
    task,
  },
});

export const deleteTaskFailed = (id, error) => ({
  type: ActionTypes.TASK_DELETE_FAILED,
  payload: {
    id,
    error,
  },
});

export const deleteTaskReceived = (task) => ({
  type: ActionTypes.TASK_DELETE_RECEIVED,
  payload: {
    task,
  },
});
