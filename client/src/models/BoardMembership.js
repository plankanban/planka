/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'BoardMembership';

  static fields = {
    id: attr(),
    role: attr(),
    canComment: attr(),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'memberships',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'boardMemberships',
    }),
  };

  static reducer({ type, payload }, BoardMembership) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
        if (payload.boardMemberships) {
          payload.boardMemberships.forEach((boardMembership) => {
            BoardMembership.upsert(boardMembership);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        BoardMembership.all().delete();

        payload.boardMemberships.forEach((boardMembership) => {
          BoardMembership.upsert(boardMembership);
        });

        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_CREATE_HANDLE:
      case ActionTypes.BOARD_CREATE__SUCCESS:
      case ActionTypes.BOARD_CREATE_HANDLE:
      case ActionTypes.BOARD_FETCH__SUCCESS:
        payload.boardMemberships.forEach((boardMembership) => {
          BoardMembership.upsert(boardMembership);
        });

        break;
      case ActionTypes.BOARD_MEMBERSHIP_CREATE:
      case ActionTypes.BOARD_MEMBERSHIP_UPDATE__SUCCESS:
      case ActionTypes.BOARD_MEMBERSHIP_UPDATE_HANDLE:
        BoardMembership.upsert(payload.boardMembership);

        break;
      case ActionTypes.BOARD_MEMBERSHIP_CREATE__SUCCESS:
        BoardMembership.withId(payload.localId).delete();
        BoardMembership.upsert(payload.boardMembership);

        break;
      case ActionTypes.BOARD_MEMBERSHIP_CREATE__FAILURE:
        BoardMembership.withId(payload.localId).delete();

        break;
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        BoardMembership.upsert(payload.boardMembership);

        if (payload.boardMemberships) {
          payload.boardMemberships.forEach((boardMembership) => {
            BoardMembership.upsert(boardMembership);
          });
        }

        break;
      case ActionTypes.BOARD_MEMBERSHIP_UPDATE:
        BoardMembership.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.BOARD_MEMBERSHIP_DELETE:
        BoardMembership.withId(payload.id).deleteWithRelated(payload.isCurrentUser);

        break;
      case ActionTypes.BOARD_MEMBERSHIP_DELETE__SUCCESS:
      case ActionTypes.BOARD_MEMBERSHIP_DELETE_HANDLE: {
        const boardMembershipModel = BoardMembership.withId(payload.boardMembership.id);

        if (boardMembershipModel) {
          boardMembershipModel.deleteWithRelated(payload.isCurrentUser);
        }

        break;
      }
      default:
    }
  }

  deleteRelated(isCurrentUser = false) {
    if (isCurrentUser) {
      this.board.isSubscribed = false;
    }

    this.board.cards.toModelArray().forEach((cardModel) => {
      if (isCurrentUser) {
        cardModel.update({
          isSubscribed: false,
        });
      }

      try {
        cardModel.users.remove(this.userId);
      } catch {
        /* empty */
      }

      cardModel.taskLists.toModelArray().forEach((taskListModel) => {
        taskListModel.tasks.toModelArray().forEach((taskModel) => {
          if (taskModel.assigneeUserId === this.userId) {
            taskModel.update({
              assigneeUserId: null,
            });
          }
        });
      });
    });

    try {
      this.board.filterUsers.remove(this.userId);
    } catch {
      /* empty */
    }
  }

  deleteWithRelated(isCurrentUser) {
    this.deleteRelated(isCurrentUser);
    this.delete();
  }
}
