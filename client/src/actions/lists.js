import ActionTypes from '../constants/ActionTypes';

const createList = (list) => ({
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

const handleListCreate = (list) => ({
  type: ActionTypes.LIST_CREATE_HANDLE,
  payload: {
    list,
  },
});

const updateList = (id, data) => ({
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

const handleListUpdate = (list) => ({
  type: ActionTypes.LIST_UPDATE_HANDLE,
  payload: {
    list,
  },
});

const deleteList = (id) => ({
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

const handleListDelete = (list) => ({
  type: ActionTypes.LIST_DELETE_HANDLE,
  payload: {
    list,
  },
});

export default {
  createList,
  handleListCreate,
  updateList,
  handleListUpdate,
  deleteList,
  handleListDelete,
};
