/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createCustomFieldGroup = (customFieldGroup) => ({
  type: ActionTypes.CUSTOM_FIELD_GROUP_CREATE,
  payload: {
    customFieldGroup,
  },
});

createCustomFieldGroup.success = (localId, customFieldGroup) => ({
  type: ActionTypes.CUSTOM_FIELD_GROUP_CREATE__SUCCESS,
  payload: {
    localId,
    customFieldGroup,
  },
});

createCustomFieldGroup.failure = (localId, error) => ({
  type: ActionTypes.CUSTOM_FIELD_GROUP_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleCustomFieldGroupCreate = (customFieldGroup) => ({
  type: ActionTypes.CUSTOM_FIELD_GROUP_CREATE_HANDLE,
  payload: {
    customFieldGroup,
  },
});

const updateCustomFieldGroup = (id, data) => ({
  type: ActionTypes.CUSTOM_FIELD_GROUP_UPDATE,
  payload: {
    id,
    data,
  },
});

updateCustomFieldGroup.success = (customFieldGroup) => ({
  type: ActionTypes.CUSTOM_FIELD_GROUP_UPDATE__SUCCESS,
  payload: {
    customFieldGroup,
  },
});

updateCustomFieldGroup.failure = (id, error) => ({
  type: ActionTypes.CUSTOM_FIELD_GROUP_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleCustomFieldGroupUpdate = (customFieldGroup) => ({
  type: ActionTypes.CUSTOM_FIELD_GROUP_UPDATE_HANDLE,
  payload: {
    customFieldGroup,
  },
});

const deleteCustomFieldGroup = (id) => ({
  type: ActionTypes.CUSTOM_FIELD_GROUP_DELETE,
  payload: {
    id,
  },
});

deleteCustomFieldGroup.success = (customFieldGroup) => ({
  type: ActionTypes.CUSTOM_FIELD_GROUP_DELETE__SUCCESS,
  payload: {
    customFieldGroup,
  },
});

deleteCustomFieldGroup.failure = (id, error) => ({
  type: ActionTypes.CUSTOM_FIELD_GROUP_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleCustomFieldGroupDelete = (customFieldGroup) => ({
  type: ActionTypes.CUSTOM_FIELD_GROUP_DELETE_HANDLE,
  payload: {
    customFieldGroup,
  },
});

export default {
  createCustomFieldGroup,
  handleCustomFieldGroupCreate,
  updateCustomFieldGroup,
  handleCustomFieldGroupUpdate,
  deleteCustomFieldGroup,
  handleCustomFieldGroupDelete,
};
