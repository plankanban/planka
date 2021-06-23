import { Model, attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';

export default class extends Model {
  static modelName = 'Action';

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
      relatedName: 'actions',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'actions',
    }),
  };

  static reducer({ type, payload }, Action) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Action.all().delete();

        payload.actions.forEach((action) => {
          Action.upsert({
            ...action,
            isInCard: false,
          });
        });

        break;
      case ActionTypes.CORE_INITIALIZE:
        payload.actions.forEach((action) => {
          Action.upsert({
            ...action,
            isInCard: false,
          });
        });

        break;
      case ActionTypes.ACTIONS_FETCH__SUCCESS:
      case ActionTypes.NOTIFICATION_CREATE_HANDLE:
        payload.actions.forEach((action) => {
          Action.upsert(action);
        });

        break;
      case ActionTypes.ACTION_CREATE_HANDLE:
      case ActionTypes.ACTION_UPDATE_HANDLE:
      case ActionTypes.COMMENT_ACTION_CREATE:
      case ActionTypes.COMMENT_ACTION_UPDATE__SUCCESS:
        Action.upsert(payload.action);

        break;
      case ActionTypes.ACTION_DELETE_HANDLE:
      case ActionTypes.COMMENT_ACTION_DELETE__SUCCESS: {
        const actionModel = Action.withId(payload.action.id);

        if (actionModel) {
          actionModel.delete();
        }

        break;
      }
      case ActionTypes.COMMENT_ACTION_CREATE__SUCCESS:
        Action.withId(payload.localId).delete();
        Action.upsert(payload.action);

        break;
      case ActionTypes.COMMENT_ACTION_UPDATE:
        Action.withId(payload.id).update({
          data: payload.data,
        });

        break;
      case ActionTypes.COMMENT_ACTION_DELETE:
        Action.withId(payload.id).delete();

        break;
      default:
    }
  }
}
