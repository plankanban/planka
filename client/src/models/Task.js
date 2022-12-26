import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'Task';

  static fields = {
    id: attr(),
    position: attr(),
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
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.tasks) {
          payload.tasks.forEach((task) => {
            Task.upsert(task);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Task.all().delete();

        if (payload.tasks) {
          payload.tasks.forEach((task) => {
            Task.upsert(task);
          });
        }

        break;
      case ActionTypes.BOARD_FETCH__SUCCESS:
        payload.tasks.forEach((task) => {
          Task.upsert(task);
        });

        break;
      case ActionTypes.TASK_CREATE:
      case ActionTypes.TASK_CREATE_HANDLE:
      case ActionTypes.TASK_UPDATE__SUCCESS:
      case ActionTypes.TASK_UPDATE_HANDLE:
        Task.upsert(payload.task);

        break;
      case ActionTypes.TASK_CREATE__SUCCESS:
        Task.withId(payload.localId).delete();
        Task.upsert(payload.task);

        break;
      case ActionTypes.TASK_UPDATE:
        Task.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.TASK_DELETE:
        Task.withId(payload.id).delete();

        break;
      case ActionTypes.TASK_DELETE__SUCCESS:
      case ActionTypes.TASK_DELETE_HANDLE: {
        const taskModel = Task.withId(payload.task.id);

        if (taskModel) {
          taskModel.delete();
        }

        break;
      }
      default:
    }
  }
}
