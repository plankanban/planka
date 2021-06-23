import EntryActionTypes from '../../constants/EntryActionTypes';

export const createTaskInCurrentCard = (data) => ({
  type: EntryActionTypes.TASK_IN_CURRENT_CARD_CREATE,
  payload: {
    data,
  },
});

export const handleTaskCreate = (task) => ({
  type: EntryActionTypes.TASK_CREATE_HANDLE,
  payload: {
    task,
  },
});

export const updateTask = (id, data) => ({
  type: EntryActionTypes.TASK_UPDATE,
  payload: {
    id,
    data,
  },
});

export const handleTaskUpdate = (task) => ({
  type: EntryActionTypes.TASK_UPDATE_HANDLE,
  payload: {
    task,
  },
});

export const deleteTask = (id) => ({
  type: EntryActionTypes.TASK_DELETE,
  payload: {
    id,
  },
});

export const handleTaskDelete = (task) => ({
  type: EntryActionTypes.TASK_DELETE_HANDLE,
  payload: {
    task,
  },
});
