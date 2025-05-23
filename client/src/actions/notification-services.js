/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createNotificationService = (notificationService) => ({
  type: ActionTypes.NOTIFICATION_SERVICE_CREATE,
  payload: {
    notificationService,
  },
});

createNotificationService.success = (localId, notificationService) => ({
  type: ActionTypes.NOTIFICATION_SERVICE_CREATE__SUCCESS,
  payload: {
    localId,
    notificationService,
  },
});

createNotificationService.failure = (localId, error) => ({
  type: ActionTypes.NOTIFICATION_SERVICE_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleNotificationServiceCreate = (notificationService) => ({
  type: ActionTypes.NOTIFICATION_SERVICE_CREATE_HANDLE,
  payload: {
    notificationService,
  },
});

const updateNotificationService = (id, data) => ({
  type: ActionTypes.NOTIFICATION_SERVICE_UPDATE,
  payload: {
    id,
    data,
  },
});

updateNotificationService.success = (notificationService) => ({
  type: ActionTypes.NOTIFICATION_SERVICE_UPDATE__SUCCESS,
  payload: {
    notificationService,
  },
});

updateNotificationService.failure = (id, error) => ({
  type: ActionTypes.NOTIFICATION_SERVICE_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleNotificationServiceUpdate = (notificationService) => ({
  type: ActionTypes.NOTIFICATION_SERVICE_UPDATE_HANDLE,
  payload: {
    notificationService,
  },
});

const testNotificationService = (id) => ({
  type: ActionTypes.NOTIFICATION_SERVICE_TEST,
  payload: {
    id,
  },
});

testNotificationService.success = (notificationService) => ({
  type: ActionTypes.NOTIFICATION_SERVICE_TEST__SUCCESS,
  payload: {
    notificationService,
  },
});

testNotificationService.failure = (id, error) => ({
  type: ActionTypes.NOTIFICATION_SERVICE_TEST__FAILURE,
  payload: {
    id,
    error,
  },
});

const deleteNotificationService = (id) => ({
  type: ActionTypes.NOTIFICATION_SERVICE_DELETE,
  payload: {
    id,
  },
});

deleteNotificationService.success = (notificationService) => ({
  type: ActionTypes.NOTIFICATION_SERVICE_DELETE__SUCCESS,
  payload: {
    notificationService,
  },
});

deleteNotificationService.failure = (id, error) => ({
  type: ActionTypes.NOTIFICATION_SERVICE_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleNotificationServiceDelete = (notificationService) => ({
  type: ActionTypes.NOTIFICATION_SERVICE_DELETE_HANDLE,
  payload: {
    notificationService,
  },
});

export default {
  createNotificationService,
  handleNotificationServiceCreate,
  updateNotificationService,
  handleNotificationServiceUpdate,
  testNotificationService,
  deleteNotificationService,
  handleNotificationServiceDelete,
};
