import ActionTypes from '../constants/ActionTypes';

/* Actions */

export const createList = (list) => ({
  type: ActionTypes.LIST_CREATE,
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

export const deleteList = (id) => ({
  type: ActionTypes.LIST_DELETE,
  payload: {
    id,
  },
});

/* Events */

export const createListRequested = (localId, data) => ({
  type: ActionTypes.LIST_CREATE_REQUESTED,
  payload: {
    localId,
    data,
  },
});

export const createListSucceeded = (localId, list) => ({
  type: ActionTypes.LIST_CREATE_SUCCEEDED,
  payload: {
    localId,
    list,
  },
});

export const createListFailed = (localId, error) => ({
  type: ActionTypes.LIST_CREATE_FAILED,
  payload: {
    localId,
    error,
  },
});

export const createListReceived = (list) => ({
  type: ActionTypes.LIST_CREATE_RECEIVED,
  payload: {
    list,
  },
});

export const updateListRequested = (id, data) => ({
  type: ActionTypes.LIST_UPDATE_REQUESTED,
  payload: {
    id,
    data,
  },
});

export const updateListSucceeded = (list) => ({
  type: ActionTypes.LIST_UPDATE_SUCCEEDED,
  payload: {
    list,
  },
});

export const updateListFailed = (id, error) => ({
  type: ActionTypes.LIST_UPDATE_FAILED,
  payload: {
    id,
    error,
  },
});

export const updateListReceived = (list) => ({
  type: ActionTypes.LIST_UPDATE_RECEIVED,
  payload: {
    list,
  },
});

export const deleteListRequested = (id) => ({
  type: ActionTypes.LIST_DELETE_REQUESTED,
  payload: {
    id,
  },
});

export const deleteListSucceeded = (list) => ({
  type: ActionTypes.LIST_DELETE_SUCCEEDED,
  payload: {
    list,
  },
});

export const deleteListFailed = (id, error) => ({
  type: ActionTypes.LIST_DELETE_FAILED,
  payload: {
    id,
    error,
  },
});

export const deleteListReceived = (list) => ({
  type: ActionTypes.LIST_DELETE_RECEIVED,
  payload: {
    list,
  },
});
