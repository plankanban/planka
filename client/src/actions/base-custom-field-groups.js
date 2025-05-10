/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createBaseCustomFieldGroup = (baseCustomFieldGroup) => ({
  type: ActionTypes.BASE_CUSTOM_FIELD_GROUP_CREATE,
  payload: {
    baseCustomFieldGroup,
  },
});

createBaseCustomFieldGroup.success = (localId, baseCustomFieldGroup) => ({
  type: ActionTypes.BASE_CUSTOM_FIELD_GROUP_CREATE__SUCCESS,
  payload: {
    localId,
    baseCustomFieldGroup,
  },
});

createBaseCustomFieldGroup.failure = (localId, error) => ({
  type: ActionTypes.BASE_CUSTOM_FIELD_GROUP_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleBaseCustomFieldGroupCreate = (baseCustomFieldGroup) => ({
  type: ActionTypes.BASE_CUSTOM_FIELD_GROUP_CREATE_HANDLE,
  payload: {
    baseCustomFieldGroup,
  },
});

const updateBaseCustomFieldGroup = (id, data) => ({
  type: ActionTypes.BASE_CUSTOM_FIELD_GROUP_UPDATE,
  payload: {
    id,
    data,
  },
});

updateBaseCustomFieldGroup.success = (baseCustomFieldGroup) => ({
  type: ActionTypes.BASE_CUSTOM_FIELD_GROUP_UPDATE__SUCCESS,
  payload: {
    baseCustomFieldGroup,
  },
});

updateBaseCustomFieldGroup.failure = (id, error) => ({
  type: ActionTypes.BASE_CUSTOM_FIELD_GROUP_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleBaseCustomFieldGroupUpdate = (baseCustomFieldGroup) => ({
  type: ActionTypes.BASE_CUSTOM_FIELD_GROUP_UPDATE_HANDLE,
  payload: {
    baseCustomFieldGroup,
  },
});

const deleteBaseCustomFieldGroup = (id) => ({
  type: ActionTypes.BASE_CUSTOM_FIELD_GROUP_DELETE,
  payload: {
    id,
  },
});

deleteBaseCustomFieldGroup.success = (baseCustomFieldGroup) => ({
  type: ActionTypes.BASE_CUSTOM_FIELD_GROUP_DELETE__SUCCESS,
  payload: {
    baseCustomFieldGroup,
  },
});

deleteBaseCustomFieldGroup.failure = (id, error) => ({
  type: ActionTypes.BASE_CUSTOM_FIELD_GROUP_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleBaseCustomFieldGroupDelete = (baseCustomFieldGroup) => ({
  type: ActionTypes.BASE_CUSTOM_FIELD_GROUP_DELETE_HANDLE,
  payload: {
    baseCustomFieldGroup,
  },
});

export default {
  createBaseCustomFieldGroup,
  handleBaseCustomFieldGroupCreate,
  updateBaseCustomFieldGroup,
  handleBaseCustomFieldGroupUpdate,
  deleteBaseCustomFieldGroup,
  handleBaseCustomFieldGroupDelete,
};
