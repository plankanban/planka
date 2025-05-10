/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createTaskList = (taskList) => ({
  type: ActionTypes.TASK_LIST_CREATE,
  payload: {
    taskList,
  },
});

createTaskList.success = (localId, taskList) => ({
  type: ActionTypes.TASK_LIST_CREATE__SUCCESS,
  payload: {
    localId,
    taskList,
  },
});

createTaskList.failure = (localId, error) => ({
  type: ActionTypes.TASK_LIST_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleTaskListCreate = (taskList) => ({
  type: ActionTypes.TASK_LIST_CREATE_HANDLE,
  payload: {
    taskList,
  },
});

const updateTaskList = (id, data) => ({
  type: ActionTypes.TASK_LIST_UPDATE,
  payload: {
    id,
    data,
  },
});

updateTaskList.success = (taskList) => ({
  type: ActionTypes.TASK_LIST_UPDATE__SUCCESS,
  payload: {
    taskList,
  },
});

updateTaskList.failure = (id, error) => ({
  type: ActionTypes.TASK_LIST_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleTaskListUpdate = (taskList) => ({
  type: ActionTypes.TASK_LIST_UPDATE_HANDLE,
  payload: {
    taskList,
  },
});

const deleteTaskList = (id) => ({
  type: ActionTypes.TASK_LIST_DELETE,
  payload: {
    id,
  },
});

deleteTaskList.success = (taskList) => ({
  type: ActionTypes.TASK_LIST_DELETE__SUCCESS,
  payload: {
    taskList,
  },
});

deleteTaskList.failure = (id, error) => ({
  type: ActionTypes.TASK_LIST_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleTaskListDelete = (taskList) => ({
  type: ActionTypes.TASK_LIST_DELETE_HANDLE,
  payload: {
    taskList,
  },
});

export default {
  createTaskList,
  handleTaskListCreate,
  updateTaskList,
  handleTaskListUpdate,
  deleteTaskList,
  handleTaskListDelete,
};
