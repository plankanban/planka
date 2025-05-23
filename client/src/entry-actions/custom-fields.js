/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createCustomFieldInBaseGroup = (baseCustomFieldGroupId, data) => ({
  type: EntryActionTypes.CUSTOM_FIELD_IN_BASE_GROUP_CREATE,
  payload: {
    baseCustomFieldGroupId,
    data,
  },
});

const createCustomFieldInGroup = (customFieldGroupId, data) => ({
  type: EntryActionTypes.CUSTOM_FIELD_IN_GROUP_CREATE,
  payload: {
    customFieldGroupId,
    data,
  },
});

const handleCustomFieldCreate = (customField) => ({
  type: EntryActionTypes.CUSTOM_FIELD_CREATE_HANDLE,
  payload: {
    customField,
  },
});

const updateCustomField = (id, data) => ({
  type: EntryActionTypes.CUSTOM_FIELD_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleCustomFieldUpdate = (customField) => ({
  type: EntryActionTypes.CUSTOM_FIELD_UPDATE_HANDLE,
  payload: {
    customField,
  },
});

const moveCustomField = (id, index) => ({
  type: EntryActionTypes.CUSTOM_FIELD_MOVE,
  payload: {
    id,
    index,
  },
});

const deleteCustomField = (id) => ({
  type: EntryActionTypes.CUSTOM_FIELD_DELETE,
  payload: {
    id,
  },
});

const handleCustomFieldDelete = (customField) => ({
  type: EntryActionTypes.CUSTOM_FIELD_DELETE_HANDLE,
  payload: {
    customField,
  },
});

export default {
  createCustomFieldInBaseGroup,
  createCustomFieldInGroup,
  handleCustomFieldCreate,
  updateCustomField,
  handleCustomFieldUpdate,
  moveCustomField,
  deleteCustomField,
  handleCustomFieldDelete,
};
