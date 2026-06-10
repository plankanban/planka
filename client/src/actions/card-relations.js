/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createCardRelation = (cardId, data) => ({
  type: ActionTypes.CARD_RELATION_CREATE,
  payload: {
    cardId,
    data,
  },
});

createCardRelation.success = (cardRelation) => ({
  type: ActionTypes.CARD_RELATION_CREATE__SUCCESS,
  payload: {
    cardRelation,
  },
});

createCardRelation.failure = (cardId, error) => ({
  type: ActionTypes.CARD_RELATION_CREATE__FAILURE,
  payload: {
    cardId,
    error,
  },
});

const handleCardRelationCreate = (cardRelation) => ({
  type: ActionTypes.CARD_RELATION_CREATE_HANDLE,
  payload: {
    cardRelation,
  },
});

const deleteCardRelation = (cardId, id) => ({
  type: ActionTypes.CARD_RELATION_DELETE,
  payload: {
    cardId,
    id,
  },
});

deleteCardRelation.success = (cardRelation) => ({
  type: ActionTypes.CARD_RELATION_DELETE__SUCCESS,
  payload: {
    cardRelation,
  },
});

deleteCardRelation.failure = (cardId, id, error) => ({
  type: ActionTypes.CARD_RELATION_DELETE__FAILURE,
  payload: {
    cardId,
    id,
    error,
  },
});

const handleCardRelationDelete = (cardRelation) => ({
  type: ActionTypes.CARD_RELATION_DELETE_HANDLE,
  payload: {
    cardRelation,
  },
});

const addRelationKindToFilterInCurrentBoard = (id, boardId) => ({
  type: ActionTypes.RELATION_KIND_TO_FILTER_IN_CURRENT_BOARD_ADD,
  payload: {
    id,
    boardId,
  },
});

const removeRelationKindFromFilterInCurrentBoard = (id, boardId) => ({
  type: ActionTypes.RELATION_KIND_FROM_FILTER_IN_CURRENT_BOARD_REMOVE,
  payload: {
    id,
    boardId,
  },
});

export default {
  createCardRelation,
  handleCardRelationCreate,
  deleteCardRelation,
  handleCardRelationDelete,
  addRelationKindToFilterInCurrentBoard,
  removeRelationKindFromFilterInCurrentBoard,
};
