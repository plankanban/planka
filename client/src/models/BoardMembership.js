import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'BoardMembership';

  static fields = {
    id: attr(),
    role: attr(),
    canComment: attr(),
    createdAt: attr({
      getDefault: () => new Date(),
    }),
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
      case ActionTypes.BOARD_FETCH__SUCCESS:
        payload.boardMemberships.forEach((boardMembership) => {
          BoardMembership.upsert(boardMembership);
        });

        break;
      case ActionTypes.BOARD_MEMBERSHIP_CREATE:
        BoardMembership.upsert(payload.boardMembership);

        break;
      case ActionTypes.BOARD_MEMBERSHIP_CREATE__SUCCESS:
        BoardMembership.withId(payload.localId).delete();
        BoardMembership.upsert(payload.boardMembership);

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
      case ActionTypes.BOARD_MEMBERSHIP_UPDATE__SUCCESS:
      case ActionTypes.BOARD_MEMBERSHIP_UPDATE_HANDLE:
        BoardMembership.upsert(payload.boardMembership);

        break;
      case ActionTypes.BOARD_MEMBERSHIP_DELETE:
        BoardMembership.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.BOARD_MEMBERSHIP_DELETE__SUCCESS:
      case ActionTypes.BOARD_MEMBERSHIP_DELETE_HANDLE: {
        const boardMembershipModel = BoardMembership.withId(payload.boardMembership.id);

        if (boardMembershipModel) {
          boardMembershipModel.deleteWithRelated();
        }

        break;
      }
      default:
    }
  }

  deleteRelated() {
    this.board.cards.toModelArray().forEach((cardModel) => {
      try {
        cardModel.users.remove(this.userId);
      } catch {} // eslint-disable-line no-empty
    });

    try {
      this.board.filterUsers.remove(this.userId);
    } catch {} // eslint-disable-line no-empty
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
