/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createNotificationServiceInCurrentUser = (data) => ({
  type: EntryActionTypes.NOTIFICATION_SERVICE_IN_CURRENT_USER_CREATE,
  payload: {
    data,
  },
});

const createNotificationServiceInBoard = (boardId, data) => ({
  type: EntryActionTypes.NOTIFICATION_SERVICE_IN_BOARD_CREATE,
  payload: {
    boardId,
    data,
  },
});

const handleNotificationServiceCreate = (notificationService) => ({
  type: EntryActionTypes.NOTIFICATION_SERVICE_CREATE_HANDLE,
  payload: {
    notificationService,
  },
});

const updateNotificationService = (id, data) => ({
  type: EntryActionTypes.NOTIFICATION_SERVICE_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleNotificationServiceUpdate = (notificationService) => ({
  type: EntryActionTypes.NOTIFICATION_SERVICE_UPDATE_HANDLE,
  payload: {
    notificationService,
  },
});

const testNotificationService = (id) => ({
  type: EntryActionTypes.NOTIFICATION_SERVICE_TEST,
  payload: {
    id,
  },
});

const deleteNotificationService = (id) => ({
  type: EntryActionTypes.NOTIFICATION_SERVICE_DELETE,
  payload: {
    id,
  },
});

const handleNotificationServiceDelete = (notificationService) => ({
  type: EntryActionTypes.NOTIFICATION_SERVICE_DELETE_HANDLE,
  payload: {
    notificationService,
  },
});

export default {
  createNotificationServiceInCurrentUser,
  createNotificationServiceInBoard,
  handleNotificationServiceCreate,
  updateNotificationService,
  handleNotificationServiceUpdate,
  testNotificationService,
  deleteNotificationService,
  handleNotificationServiceDelete,
};
