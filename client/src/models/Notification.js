import { Model, attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';

export default class extends Model {
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
    actionId: fk({
      to: 'Action',
      as: 'action',
      relatedName: 'notifications',
    }),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'notifications',
    }),
  };

  static reducer({ type, payload }, Notification) {
    switch (type) {
      case ActionTypes.NOTIFICATIONS_DELETE:
        payload.ids.forEach((id) => {
          Notification.withId(id).delete();
        });

        break;
      case ActionTypes.NOTIFICATIONS_FETCH_SUCCEEDED:
        payload.notifications.forEach((notification) => {
          Notification.upsert(notification);
        });

        break;
      case ActionTypes.NOTIFICATION_CREATE_RECEIVED:
        Notification.upsert(payload.notification);

        break;
      case ActionTypes.NOTIFICATION_DELETE_RECEIVED: {
        const notificationModel = Notification.withId(payload.notification.id);

        if (notificationModel) {
          notificationModel.delete();
        }

        break;
      }
      default:
    }
  }
}
