/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createCustomField = (customField) => ({
  type: ActionTypes.CUSTOM_FIELD_CREATE,
  payload: {
    customField,
  },
});

createCustomField.success = (localId, customField) => ({
  type: ActionTypes.CUSTOM_FIELD_CREATE__SUCCESS,
  payload: {
    localId,
    customField,
  },
});

createCustomField.failure = (localId, error) => ({
  type: ActionTypes.CUSTOM_FIELD_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleCustomFieldCreate = (customField) => ({
  type: ActionTypes.CUSTOM_FIELD_CREATE_HANDLE,
  payload: {
    customField,
  },
});

const updateCustomField = (id, data) => ({
  type: ActionTypes.CUSTOM_FIELD_UPDATE,
  payload: {
    id,
    data,
  },
});

updateCustomField.success = (customField) => ({
  type: ActionTypes.CUSTOM_FIELD_UPDATE__SUCCESS,
  payload: {
    customField,
  },
});

updateCustomField.failure = (id, error) => ({
  type: ActionTypes.CUSTOM_FIELD_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleCustomFieldUpdate = (customField) => ({
  type: ActionTypes.CUSTOM_FIELD_UPDATE_HANDLE,
  payload: {
    customField,
  },
});

const deleteCustomField = (id) => ({
  type: ActionTypes.CUSTOM_FIELD_DELETE,
  payload: {
    id,
  },
});

deleteCustomField.success = (customField) => ({
  type: ActionTypes.CUSTOM_FIELD_DELETE__SUCCESS,
  payload: {
    customField,
  },
});

deleteCustomField.failure = (id, error) => ({
  type: ActionTypes.CUSTOM_FIELD_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleCustomFieldDelete = (customField) => ({
  type: ActionTypes.CUSTOM_FIELD_DELETE_HANDLE,
  payload: {
    customField,
  },
});

export default {
  createCustomField,
  handleCustomFieldCreate,
  updateCustomField,
  handleCustomFieldUpdate,
  deleteCustomField,
  handleCustomFieldDelete,
};
