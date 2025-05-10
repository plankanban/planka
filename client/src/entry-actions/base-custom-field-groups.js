/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createBaseCustomFieldGroupInCurrentProject = (data) => ({
  type: EntryActionTypes.BASE_CUSTOM_FIELD_GROUP_IN_CURRENT_PROJECT_CREATE,
  payload: {
    data,
  },
});

const handleBaseCustomFieldGroupCreate = (baseCustomFieldGroup) => ({
  type: EntryActionTypes.BASE_CUSTOM_FIELD_GROUP_CREATE_HANDLE,
  payload: {
    baseCustomFieldGroup,
  },
});

const updateBaseCustomFieldGroup = (id, data) => ({
  type: EntryActionTypes.BASE_CUSTOM_FIELD_GROUP_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleBaseCustomFieldGroupUpdate = (baseCustomFieldGroup) => ({
  type: EntryActionTypes.BASE_CUSTOM_FIELD_GROUP_UPDATE_HANDLE,
  payload: {
    baseCustomFieldGroup,
  },
});

const deleteBaseCustomFieldGroup = (id) => ({
  type: EntryActionTypes.BASE_CUSTOM_FIELD_GROUP_DELETE,
  payload: {
    id,
  },
});

const handleBaseCustomFieldGroupDelete = (baseCustomFieldGroup) => ({
  type: EntryActionTypes.BASE_CUSTOM_FIELD_GROUP_DELETE_HANDLE,
  payload: {
    baseCustomFieldGroup,
  },
});

export default {
  createBaseCustomFieldGroupInCurrentProject,
  handleBaseCustomFieldGroupCreate,
  updateBaseCustomFieldGroup,
  handleBaseCustomFieldGroupUpdate,
  deleteBaseCustomFieldGroup,
  handleBaseCustomFieldGroupDelete,
};
