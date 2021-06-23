import ActionTypes from '../constants/ActionTypes';

export const createList = (list) => ({
  type: ActionTypes.LIST_CREATE,
  payload: {
    list,
  },
});

createList.success = (localId, list) => ({
  type: ActionTypes.LIST_CREATE__SUCCESS,
  payload: {
    localId,
    list,
  },
});

createList.failure = (localId, error) => ({
  type: ActionTypes.LIST_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

export const handleListCreate = (list) => ({
  type: ActionTypes.LIST_CREATE_HANDLE,
  payload: {
    list,
  },
});

export const updateList = (id, data) => ({
  type: ActionTypes.LIST_UPDATE,
  payload: {
    id,
    data,
  },
});

updateList.success = (list) => ({
  type: ActionTypes.LIST_UPDATE__SUCCESS,
  payload: {
    list,
  },
});

updateList.failure = (id, error) => ({
  type: ActionTypes.LIST_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

export const handleListUpdate = (list) => ({
  type: ActionTypes.LIST_UPDATE_HANDLE,
  payload: {
    list,
  },
});

export const deleteList = (id) => ({
  type: ActionTypes.LIST_DELETE,
  payload: {
    id,
  },
});

deleteList.success = (list) => ({
  type: ActionTypes.LIST_DELETE__SUCCESS,
  payload: {
    list,
  },
});

deleteList.failure = (id, error) => ({
  type: ActionTypes.LIST_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

export const handleListDelete = (list) => ({
  type: ActionTypes.LIST_DELETE_HANDLE,
  payload: {
    list,
  },
});
