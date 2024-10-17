import { attr, fk, oneToOne } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'Notification';

  static fields = {
    id: attr(),
    type: attr(),
    data: attr(),
    isRead: attr(),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'notifications',
    }),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'notifications',
    }),
    activityId: oneToOne({
      to: 'Activity',
      as: 'activity',
    }),
  };

  static reducer({ type, payload }, Notification) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.deletedNotifications) {
          payload.deletedNotifications.forEach((notification) => {
            Notification.withId(notification.id).deleteWithRelated();
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Notification.all().delete();

        payload.notifications.forEach((notification) => {
          Notification.upsert(notification);
        });

        break;
      case ActionTypes.CORE_INITIALIZE:
        payload.notifications.forEach((notification) => {
          Notification.upsert(notification);
        });

        break;
      case ActionTypes.NOTIFICATION_CREATE_HANDLE:
        Notification.upsert(payload.notification);

        break;
      case ActionTypes.NOTIFICATION_DELETE:
        Notification.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.NOTIFICATION_DELETE__SUCCESS:
      case ActionTypes.NOTIFICATION_DELETE_HANDLE: {
        const notificationModel = Notification.withId(payload.notification.id);

        if (notificationModel) {
          notificationModel.deleteWithRelated();
        }

        break;
      }
      default:
    }
  }

  deleteRelated() {
    if (this.action && !this.action.isInCard) {
      this.action.delete();
    }
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
