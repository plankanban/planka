/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const updateCustomFieldValue = (customFieldValue) => ({
  type: ActionTypes.CUSTOM_FIELD_VALUE_UPDATE,
  payload: {
    customFieldValue,
  },
});

updateCustomFieldValue.success = (localId, customFieldValue) => ({
  type: ActionTypes.CUSTOM_FIELD_VALUE_UPDATE__SUCCESS,
  payload: {
    localId,
    customFieldValue,
  },
});

updateCustomFieldValue.failure = (localId, error) => ({
  type: ActionTypes.CUSTOM_FIELD_VALUE_UPDATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleCustomFieldValueUpdate = (customFieldValue) => ({
  type: ActionTypes.CUSTOM_FIELD_VALUE_UPDATE_HANDLE,
  payload: {
    customFieldValue,
  },
});

const deleteCustomFieldValue = (id) => ({
  type: ActionTypes.CUSTOM_FIELD_VALUE_DELETE,
  payload: {
    id,
  },
});

deleteCustomFieldValue.success = (customFieldValue) => ({
  type: ActionTypes.CUSTOM_FIELD_VALUE_DELETE__SUCCESS,
  payload: {
    customFieldValue,
  },
});

deleteCustomFieldValue.failure = (id, error) => ({
  type: ActionTypes.CUSTOM_FIELD_VALUE_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleCustomFieldValueDelete = (customFieldValue) => ({
  type: ActionTypes.CUSTOM_FIELD_VALUE_DELETE_HANDLE,
  payload: {
    customFieldValue,
  },
});

export default {
  updateCustomFieldValue,
  handleCustomFieldValueUpdate,
  deleteCustomFieldValue,
  handleCustomFieldValueDelete,
};
