import { Model, attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';

export default class extends Model {
  static modelName = 'Task';

  static fields = {
    id: attr(),
    name: attr(),
    isCompleted: attr({
      getDefault: () => false,
    }),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'tasks',
    }),
  };

  static reducer({ type, payload }, Task) {
    switch (type) {
      case ActionTypes.BOARD_FETCH_SUCCEEDED:
      case ActionTypes.CARD_CREATE_SUCCEEDED:
      case ActionTypes.CARD_CREATE_RECEIVED:
        payload.tasks.forEach((task) => {
          Task.upsert(task);
        });

        break;
      case ActionTypes.TASK_CREATE:
      case ActionTypes.TASK_CREATE_RECEIVED:
        Task.upsert(payload.task);

        break;
      case ActionTypes.TASK_UPDATE:
        Task.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.TASK_DELETE:
        Task.withId(payload.id).delete();

        break;
      case ActionTypes.TASK_CREATE_SUCCEEDED:
        Task.withId(payload.localId).delete();
        Task.upsert(payload.task);

        break;
      case ActionTypes.TASK_UPDATE_RECEIVED:
        Task.withId(payload.task.id).update(payload.task);

        break;
      case ActionTypes.TASK_DELETE_RECEIVED:
        Task.withId(payload.task.id).delete();

        break;
      default:
    }
  }
}
