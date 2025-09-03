/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'TaskList';

  static fields = {
    id: attr(),
    position: attr(),
    name: attr(),
    showOnFrontOfCard: attr(),
    hideCompletedTasks: attr(),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'taskLists',
    }),
  };

  static reducer({ type, payload }, TaskList) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
      case ActionTypes.LIST_UPDATE_HANDLE:
      case ActionTypes.CARD_UPDATE_HANDLE:
        if (payload.taskLists) {
          payload.taskLists.forEach((taskList) => {
            TaskList.upsert(taskList);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        TaskList.all().delete();

        if (payload.taskLists) {
          payload.taskLists.forEach((taskList) => {
            TaskList.upsert(taskList);
          });
        }

        break;
      case ActionTypes.BOARD_FETCH__SUCCESS:
      case ActionTypes.CARDS_FETCH__SUCCESS:
      case ActionTypes.CARD_CREATE_HANDLE:
      case ActionTypes.CARD_DUPLICATE__SUCCESS:
        payload.taskLists.forEach((taskList) => {
          TaskList.upsert(taskList);
        });

        break;
      case ActionTypes.TASK_LIST_CREATE:
      case ActionTypes.TASK_LIST_CREATE_HANDLE:
      case ActionTypes.TASK_LIST_UPDATE__SUCCESS:
      case ActionTypes.TASK_LIST_UPDATE_HANDLE:
        TaskList.upsert(payload.taskList);

        break;
      case ActionTypes.TASK_LIST_CREATE__SUCCESS:
        TaskList.withId(payload.localId).delete();
        TaskList.upsert(payload.taskList);

        break;
      case ActionTypes.TASK_LIST_CREATE__FAILURE:
        TaskList.withId(payload.localId).delete();

        break;
      case ActionTypes.TASK_LIST_UPDATE:
        TaskList.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.TASK_LIST_DELETE:
        TaskList.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.TASK_LIST_DELETE__SUCCESS:
      case ActionTypes.TASK_LIST_DELETE_HANDLE: {
        const taskListModel = TaskList.withId(payload.taskList.id);

        if (taskListModel) {
          taskListModel.deleteWithRelated();
        }

        break;
      }
      default:
    }
  }

  getTasksQuerySet() {
    return this.tasks.orderBy(['position', 'id.length', 'id']);
  }

  duplicate(id, data, rootId) {
    if (rootId === undefined) {
      rootId = id; // eslint-disable-line no-param-reassign
    }

    const taskListModel = this.getClass().create({
      id,
      cardId: this.cardId,
      position: this.position,
      name: this.name,
      showOnFrontOfCard: this.showOnFrontOfCard,
      hideCompletedTasks: this.hideCompletedTasks,
      ...data,
    });

    this.tasks.toModelArray().forEach((taskModel) => {
      taskModel.duplicate(`${taskModel.id}-${rootId}`, {
        taskListId: taskListModel.id,
      });
    });

    return taskListModel;
  }

  deleteRelated() {
    this.tasks.delete();
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
