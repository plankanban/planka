/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'NotificationService';

  static fields = {
    id: attr(),
    url: attr(),
    format: attr(),
    isTesting: attr({
      getDefault: () => false,
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'notificationServices',
    }),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'notificationServices',
    }),
  };

  static reducer({ type, payload }, NotificationService) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        NotificationService.all().delete();

        payload.notificationServices.forEach((notificationService) => {
          NotificationService.upsert(notificationService);
        });

        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_CREATE_HANDLE:
        payload.notificationServices.forEach((notificationService) => {
          NotificationService.upsert(notificationService);
        });

        break;
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.notificationServices) {
          payload.notificationServices.forEach((notificationService) => {
            NotificationService.upsert(notificationService);
          });
        }

        break;
      case ActionTypes.NOTIFICATION_SERVICE_CREATE:
      case ActionTypes.NOTIFICATION_SERVICE_CREATE_HANDLE:
      case ActionTypes.NOTIFICATION_SERVICE_UPDATE__SUCCESS:
      case ActionTypes.NOTIFICATION_SERVICE_UPDATE_HANDLE:
        NotificationService.upsert(payload.notificationService);

        break;
      case ActionTypes.NOTIFICATION_SERVICE_CREATE__SUCCESS:
        NotificationService.withId(payload.localId).delete();
        NotificationService.upsert(payload.notificationService);

        break;
      case ActionTypes.NOTIFICATION_SERVICE_CREATE__FAILURE:
        NotificationService.withId(payload.localId).delete();

        break;
      case ActionTypes.NOTIFICATION_SERVICE_UPDATE:
        NotificationService.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.NOTIFICATION_SERVICE_TEST:
        NotificationService.withId(payload.id).update({
          isTesting: true,
        });

        break;
      case ActionTypes.NOTIFICATION_SERVICE_TEST__SUCCESS:
        NotificationService.upsert({
          ...payload.notificationService,
          isTesting: false,
        });

        break;
      case ActionTypes.NOTIFICATION_SERVICE_TEST__FAILURE:
        NotificationService.withId(payload.id).update({
          isTesting: false,
        });

        break;
      case ActionTypes.NOTIFICATION_SERVICE_DELETE:
        NotificationService.withId(payload.id).delete();

        break;
      case ActionTypes.NOTIFICATION_SERVICE_DELETE__SUCCESS:
      case ActionTypes.NOTIFICATION_SERVICE_DELETE_HANDLE: {
        const notificationServiceModel = NotificationService.withId(payload.notificationService.id);

        if (notificationServiceModel) {
          notificationServiceModel.delete();
        }

        break;
      }
      default:
    }
  }
}
