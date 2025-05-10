/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createTask = (task) => ({
  type: ActionTypes.TASK_CREATE,
  payload: {
    task,
  },
});

createTask.success = (localId, task) => ({
  type: ActionTypes.TASK_CREATE__SUCCESS,
  payload: {
    localId,
    task,
  },
});

createTask.failure = (localId, error) => ({
  type: ActionTypes.TASK_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleTaskCreate = (task) => ({
  type: ActionTypes.TASK_CREATE_HANDLE,
  payload: {
    task,
  },
});

const updateTask = (id, data) => ({
  type: ActionTypes.TASK_UPDATE,
  payload: {
    id,
    data,
  },
});

updateTask.success = (task) => ({
  type: ActionTypes.TASK_UPDATE__SUCCESS,
  payload: {
    task,
  },
});

updateTask.failure = (id, error) => ({
  type: ActionTypes.TASK_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleTaskUpdate = (task) => ({
  type: ActionTypes.TASK_UPDATE_HANDLE,
  payload: {
    task,
  },
});

const deleteTask = (id) => ({
  type: ActionTypes.TASK_DELETE,
  payload: {
    id,
  },
});

deleteTask.success = (task) => ({
  type: ActionTypes.TASK_DELETE__SUCCESS,
  payload: {
    task,
  },
});

deleteTask.failure = (id, error) => ({
  type: ActionTypes.TASK_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleTaskDelete = (task) => ({
  type: ActionTypes.TASK_DELETE_HANDLE,
  payload: {
    task,
  },
});

export default {
  createTask,
  handleTaskCreate,
  updateTask,
  handleTaskUpdate,
  deleteTask,
  handleTaskDelete,
};
