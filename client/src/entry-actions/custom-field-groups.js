/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createCustomFieldGroupInCurrentBoard = (data) => ({
  type: EntryActionTypes.CUSTOM_FIELD_GROUP_IN_CURRENT_BOARD_CREATE,
  payload: {
    data,
  },
});

const createCustomFieldGroupInCurrentCard = (data) => ({
  type: EntryActionTypes.CUSTOM_FIELD_GROUP_IN_CURRENT_CARD_CREATE,
  payload: {
    data,
  },
});

const handleCustomFieldGroupCreate = (customFieldGroup) => ({
  type: EntryActionTypes.CUSTOM_FIELD_GROUP_CREATE_HANDLE,
  payload: {
    customFieldGroup,
  },
});

const updateCustomFieldGroup = (id, data) => ({
  type: EntryActionTypes.CUSTOM_FIELD_GROUP_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleCustomFieldGroupUpdate = (customFieldGroup) => ({
  type: EntryActionTypes.CUSTOM_FIELD_GROUP_UPDATE_HANDLE,
  payload: {
    customFieldGroup,
  },
});

const moveCustomFieldGroup = (id, index) => ({
  type: EntryActionTypes.CUSTOM_FIELD_GROUP_MOVE,
  payload: {
    id,
    index,
  },
});

const deleteCustomFieldGroup = (id) => ({
  type: EntryActionTypes.CUSTOM_FIELD_GROUP_DELETE,
  payload: {
    id,
  },
});

const handleCustomFieldGroupDelete = (customFieldGroup) => ({
  type: EntryActionTypes.CUSTOM_FIELD_GROUP_DELETE_HANDLE,
  payload: {
    customFieldGroup,
  },
});

export default {
  createCustomFieldGroupInCurrentBoard,
  createCustomFieldGroupInCurrentCard,
  handleCustomFieldGroupCreate,
  updateCustomFieldGroup,
  handleCustomFieldGroupUpdate,
  moveCustomFieldGroup,
  deleteCustomFieldGroup,
  handleCustomFieldGroupDelete,
};
