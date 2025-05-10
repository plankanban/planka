/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createTaskListInCurrentCard = (data) => ({
  type: EntryActionTypes.TASK_LIST_IN_CURRENT_CARD_CREATE,
  payload: {
    data,
  },
});

const handleTaskListCreate = (taskList) => ({
  type: EntryActionTypes.TASK_LIST_CREATE_HANDLE,
  payload: {
    taskList,
  },
});

const updateTaskList = (id, data) => ({
  type: EntryActionTypes.TASK_LIST_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleTaskListUpdate = (taskList) => ({
  type: EntryActionTypes.TASK_LIST_UPDATE_HANDLE,
  payload: {
    taskList,
  },
});

const moveTaskList = (id, index) => ({
  type: EntryActionTypes.TASK_LIST_MOVE,
  payload: {
    id,
    index,
  },
});

const deleteTaskList = (id) => ({
  type: EntryActionTypes.TASK_LIST_DELETE,
  payload: {
    id,
  },
});

const handleTaskListDelete = (taskList) => ({
  type: EntryActionTypes.TASK_LIST_DELETE_HANDLE,
  payload: {
    taskList,
  },
});

export default {
  createTaskListInCurrentCard,
  handleTaskListCreate,
  updateTaskList,
  handleTaskListUpdate,
  moveTaskList,
  deleteTaskList,
  handleTaskListDelete,
};
