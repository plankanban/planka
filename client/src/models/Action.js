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
      case ActionTypes.ACTIONS_FETCH_SUCCEEDED:
        payload.actions.forEach(action => {
          Action.upsert(action);
        });

        break;
      case ActionTypes.ACTION_CREATE_RECEIVED:
      case ActionTypes.COMMENT_ACTION_CREATE:
        Action.upsert(payload.action);

        break;
      case ActionTypes.ACTION_UPDATE_RECEIVED:
        Action.withId(payload.action.id).update(payload.action);

        break;
      case ActionTypes.ACTION_DELETE_RECEIVED:
        Action.withId(payload.action.id).delete();

        break;
      case ActionTypes.COMMENT_ACTION_UPDATE:
        Action.withId(payload.id).update({
          data: payload.data,
        });

        break;
      case ActionTypes.COMMENT_ACTION_DELETE:
        Action.withId(payload.id).delete();

        break;
      case ActionTypes.COMMENT_ACTION_CREATE_SUCCEEDED:
        Action.withId(payload.localId).delete();
        Action.upsert(payload.action);

        break;
      case ActionTypes.NOTIFICATIONS_FETCH_SUCCEEDED:
        payload.actions.forEach(action => {
          Action.upsert({
            ...action,
            isInCard: false,
          });
        });

        break;
      case ActionTypes.NOTIFICATION_CREATE_RECEIVED: {
        const actionModel = Action.withId(payload.action.id);

        Action.upsert({
          ...payload.action,
          isInCard: actionModel ? actionModel.isInCard : false,
        });

        break;
      }
      default:
    }
  }
}
