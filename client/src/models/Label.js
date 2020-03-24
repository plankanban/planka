import { Model, attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';

export default class extends Model {
  static modelName = 'Label';

  static fields = {
    id: attr(),
    name: attr(),
    color: attr(),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'labels',
    }),
  };

  static reducer({ type, payload }, Label) {
    switch (type) {
      case ActionTypes.BOARD_CREATE_SUCCEEDED:
      case ActionTypes.BOARD_CREATE_RECEIVED:
      case ActionTypes.BOARD_FETCH_SUCCEEDED:
        payload.labels.forEach((label) => {
          Label.upsert(label);
        });

        break;
      case ActionTypes.LABEL_CREATE:
      case ActionTypes.LABEL_CREATE_RECEIVED:
        Label.upsert(payload.label);

        break;
      case ActionTypes.LABEL_UPDATE:
        Label.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.LABEL_DELETE:
        Label.withId(payload.id).delete();

        break;
      case ActionTypes.LABEL_CREATE_SUCCEEDED:
        Label.withId(payload.localId).delete();
        Label.upsert(payload.label);

        break;
      case ActionTypes.LABEL_UPDATE_RECEIVED:
        Label.withId(payload.label.id).update(payload.label);

        break;
      case ActionTypes.LABEL_DELETE_RECEIVED:
        Label.withId(payload.label.id).delete();

        break;
      default:
    }
  }
}
