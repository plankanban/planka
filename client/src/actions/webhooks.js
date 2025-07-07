/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createWebhook = (webhook) => ({
  type: ActionTypes.WEBHOOK_CREATE,
  payload: {
    webhook,
  },
});

createWebhook.success = (localId, webhook) => ({
  type: ActionTypes.WEBHOOK_CREATE__SUCCESS,
  payload: {
    localId,
    webhook,
  },
});

createWebhook.failure = (localId, error) => ({
  type: ActionTypes.WEBHOOK_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleWebhookCreate = (webhook) => ({
  type: ActionTypes.WEBHOOK_CREATE_HANDLE,
  payload: {
    webhook,
  },
});

const updateWebhook = (id, data) => ({
  type: ActionTypes.WEBHOOK_UPDATE,
  payload: {
    id,
    data,
  },
});

updateWebhook.success = (webhook) => ({
  type: ActionTypes.WEBHOOK_UPDATE__SUCCESS,
  payload: {
    webhook,
  },
});

updateWebhook.failure = (id, error) => ({
  type: ActionTypes.WEBHOOK_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleWebhookUpdate = (webhook) => ({
  type: ActionTypes.WEBHOOK_UPDATE_HANDLE,
  payload: {
    webhook,
  },
});

const deleteWebhook = (id) => ({
  type: ActionTypes.WEBHOOK_DELETE,
  payload: {
    id,
  },
});

deleteWebhook.success = (webhook) => ({
  type: ActionTypes.WEBHOOK_DELETE__SUCCESS,
  payload: {
    webhook,
  },
});

deleteWebhook.failure = (id, error) => ({
  type: ActionTypes.WEBHOOK_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleWebhookDelete = (webhook) => ({
  type: ActionTypes.WEBHOOK_DELETE_HANDLE,
  payload: {
    webhook,
  },
});

export default {
  createWebhook,
  handleWebhookCreate,
  updateWebhook,
  handleWebhookUpdate,
  deleteWebhook,
  handleWebhookDelete,
};
