/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

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
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'activities',
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

        break;
      case ActionTypes.LIST_CARDS_MOVE__SUCCESS:
      case ActionTypes.ACTIVITIES_IN_BOARD_FETCH__SUCCESS:
      case ActionTypes.ACTIVITIES_IN_CARD_FETCH__SUCCESS:
        payload.activities.forEach((activity) => {
          Activity.upsert(activity);
        });

        break;
      case ActionTypes.CARDS_UPDATE_HANDLE:
        if (payload.activities) {
          payload.activities.forEach((activity) => {
            Activity.upsert(activity);
          });
        }

        break;
      case ActionTypes.ACTIVITY_CREATE_HANDLE:
        Activity.upsert(payload.activity);

        break;
      default:
    }
  }
}
