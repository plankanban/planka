/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'Label';

  static fields = {
    id: attr(),
    position: attr(),
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
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.labels) {
          payload.labels.forEach((label) => {
            Label.upsert(label);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Label.all().delete();

        if (payload.labels) {
          payload.labels.forEach((label) => {
            Label.upsert(label);
          });
        }

        break;
      case ActionTypes.BOARD_FETCH__SUCCESS:
        payload.labels.forEach((label) => {
          Label.upsert(label);
        });

        break;
      case ActionTypes.LABEL_CREATE:
      case ActionTypes.LABEL_FROM_CARD_CREATE:
      case ActionTypes.LABEL_CREATE_HANDLE:
      case ActionTypes.LABEL_UPDATE__SUCCESS:
      case ActionTypes.LABEL_UPDATE_HANDLE:
        Label.upsert(payload.label);

        break;
      case ActionTypes.LABEL_CREATE__SUCCESS:
      case ActionTypes.LABEL_FROM_CARD_CREATE__SUCCESS:
        Label.withId(payload.localId).delete();
        Label.upsert(payload.label);

        break;
      case ActionTypes.LABEL_CREATE__FAILURE:
      case ActionTypes.LABEL_FROM_CARD_CREATE__FAILURE:
        Label.withId(payload.localId).delete();

        break;
      case ActionTypes.LABEL_UPDATE:
        Label.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.LABEL_DELETE:
        Label.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.LABEL_DELETE__SUCCESS:
      case ActionTypes.LABEL_DELETE_HANDLE: {
        const labelModel = Label.withId(payload.label.id);

        if (labelModel) {
          labelModel.deleteWithRelated();
        }

        break;
      }
      default:
    }
  }

  deleteRelated() {
    this.board.cards.toModelArray().forEach((cardModel) => {
      try {
        cardModel.labels.remove(this.id);
      } catch {
        /* empty */
      }
    });

    try {
      this.board.filterLabels.remove(this.id);
    } catch {
      /* empty */
    }
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
