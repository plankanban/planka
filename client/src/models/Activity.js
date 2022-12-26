import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'Activity';

  static fields = {
    id: attr(),
    type: attr(),
    data: attr(),
    createdAt: attr({
      getDefault: () => new Date(),
    }),
    isInCard: attr({
      getDefault: () => true,
    }),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'activities',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'activities',
    }),
  };

  static reducer({ type, payload }, Activity) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Activity.all().delete();

        payload.activities.forEach((activity) => {
          Activity.upsert({
            ...activity,
            isInCard: false,
          });
        });

        break;
      case ActionTypes.CORE_INITIALIZE:
        payload.activities.forEach((activity) => {
          Activity.upsert({
            ...activity,
            isInCard: false,
          });
        });

        break;
      case ActionTypes.ACTIVITIES_FETCH__SUCCESS:
      case ActionTypes.ACTIVITIES_DETAILS_TOGGLE__SUCCESS:
      case ActionTypes.NOTIFICATION_CREATE_HANDLE:
        payload.activities.forEach((activity) => {
          Activity.upsert(activity);
        });

        break;
      case ActionTypes.ACTIVITY_CREATE_HANDLE:
      case ActionTypes.ACTIVITY_UPDATE_HANDLE:
      case ActionTypes.COMMENT_ACTIVITY_CREATE:
      case ActionTypes.COMMENT_ACTIVITY_UPDATE__SUCCESS:
        Activity.upsert(payload.activity);

        break;
      case ActionTypes.ACTIVITY_DELETE_HANDLE:
      case ActionTypes.COMMENT_ACTIVITY_DELETE__SUCCESS: {
        const activityModel = Activity.withId(payload.activity.id);

        if (activityModel) {
          activityModel.delete();
        }

        break;
      }
      case ActionTypes.COMMENT_ACTIVITY_CREATE__SUCCESS:
        Activity.withId(payload.localId).delete();
        Activity.upsert(payload.activity);

        break;
      case ActionTypes.COMMENT_ACTIVITY_UPDATE:
        Activity.withId(payload.id).update({
          data: payload.data,
        });

        break;
      case ActionTypes.COMMENT_ACTIVITY_DELETE:
        Activity.withId(payload.id).delete();

        break;
      default:
    }
  }
}
