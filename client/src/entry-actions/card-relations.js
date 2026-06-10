/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createCardRelation = (cardId, data) => ({
  type: EntryActionTypes.CARD_RELATION_CREATE,
  payload: {
    cardId,
    data,
  },
});

const createCardRelationInCurrentCard = (data) => ({
  type: EntryActionTypes.CARD_RELATION_IN_CURRENT_CARD_CREATE,
  payload: {
    data,
  },
});

const handleCardRelationCreate = (cardRelation) => ({
  type: EntryActionTypes.CARD_RELATION_CREATE_HANDLE,
  payload: {
    cardRelation,
  },
});

const deleteCardRelation = (cardId, id) => ({
  type: EntryActionTypes.CARD_RELATION_DELETE,
  payload: {
    cardId,
    id,
  },
});

const deleteCurrentCardRelation = (id) => ({
  type: EntryActionTypes.CARD_RELATION_IN_CURRENT_CARD_DELETE,
  payload: {
    id,
  },
});

const handleCardRelationDelete = (cardRelation) => ({
  type: EntryActionTypes.CARD_RELATION_DELETE_HANDLE,
  payload: {
    cardRelation,
  },
});

const addRelationKindToFilterInCurrentBoard = (id) => ({
  type: EntryActionTypes.RELATION_KIND_TO_FILTER_IN_CURRENT_BOARD_ADD,
  payload: {
    id,
  },
});

const removeRelationKindFromFilterInCurrentBoard = (id) => ({
  type: EntryActionTypes.RELATION_KIND_FROM_FILTER_IN_CURRENT_BOARD_REMOVE,
  payload: {
    id,
  },
});

export default {
  createCardRelation,
  createCardRelationInCurrentCard,
  handleCardRelationCreate,
  deleteCardRelation,
  deleteCurrentCardRelation,
  handleCardRelationDelete,
  addRelationKindToFilterInCurrentBoard,
  removeRelationKindFromFilterInCurrentBoard,
};
