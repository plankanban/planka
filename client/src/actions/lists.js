/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

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

const handleListUpdate = (
  list,
  isFetched,
  users,
  cards,
  cardMemberships,
  cardLabels,
  taskLists,
  tasks,
  attachments,
  customFieldGroups,
  customFields,
  customFieldValues,
) => ({
  type: ActionTypes.LIST_UPDATE_HANDLE,
  payload: {
    list,
    isFetched,
    users,
    cards,
    cardMemberships,
    cardLabels,
    taskLists,
    tasks,
    attachments,
    customFieldGroups,
    customFields,
    customFieldValues,
  },
});

const sortList = (id, data) => ({
  type: ActionTypes.LIST_SORT,
  payload: {
    id,
    data,
  },
});

sortList.success = (list, cards) => ({
  type: ActionTypes.LIST_SORT__SUCCESS,
  payload: {
    list,
    cards,
  },
});

sortList.failure = (id, error) => ({
  type: ActionTypes.LIST_SORT__FAILURE,
  payload: {
    id,
    error,
  },
});

const moveListCards = (id, nextId, cardIds) => ({
  type: ActionTypes.LIST_CARDS_MOVE,
  payload: {
    id,
    nextId,
    cardIds,
  },
});

moveListCards.success = (list, cards, activities) => ({
  type: ActionTypes.LIST_CARDS_MOVE__SUCCESS,
  payload: {
    list,
    cards,
    activities,
  },
});

moveListCards.failure = (id, error) => ({
  type: ActionTypes.LIST_CARDS_MOVE__FAILURE,
  payload: {
    id,
    error,
  },
});

const clearList = (id) => ({
  type: ActionTypes.LIST_CLEAR,
  payload: {
    id,
  },
});

clearList.success = (list) => ({
  type: ActionTypes.LIST_CLEAR__SUCCESS,
  payload: {
    list,
  },
});

clearList.failure = (id, error) => ({
  type: ActionTypes.LIST_CLEAR__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleListClear = (list) => ({
  type: ActionTypes.LIST_CLEAR_HANDLE,
  payload: {
    list,
  },
});

const deleteList = (id, trashId, cardIds) => ({
  type: ActionTypes.LIST_DELETE,
  payload: {
    id,
    trashId,
    cardIds,
  },
});

deleteList.success = (list, cards) => ({
  type: ActionTypes.LIST_DELETE__SUCCESS,
  payload: {
    list,
    cards,
  },
});

deleteList.failure = (id, error) => ({
  type: ActionTypes.LIST_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleListDelete = (list, cards) => ({
  type: ActionTypes.LIST_DELETE_HANDLE,
  payload: {
    list,
    cards,
  },
});

export default {
  createList,
  handleListCreate,
  updateList,
  handleListUpdate,
  sortList,
  moveListCards,
  clearList,
  handleListClear,
  deleteList,
  handleListDelete,
};
