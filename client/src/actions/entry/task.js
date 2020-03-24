import EntryActionTypes from '../../constants/EntryActionTypes';

export const createTaskInCurrentCard = (data) => ({
  type: EntryActionTypes.TASK_IN_CURRENT_CARD_CREATE,
  payload: {
    data,
  },
});

export const updateTask = (id, data) => ({
  type: EntryActionTypes.TASK_UPDATE,
  payload: {
    id,
    data,
  },
});

export const deleteTask = (id) => ({
  type: EntryActionTypes.TASK_DELETE,
  payload: {
    id,
  },
});
