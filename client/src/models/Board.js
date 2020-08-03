import { Model, attr, fk, many } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';

export default class extends Model {
  static modelName = 'Board';

  static fields = {
    id: attr(),
    type: attr(),
    position: attr(),
    name: attr(),
    isFetching: attr({
      getDefault: () => null,
    }),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'boards',
    }),
    filterUsers: many('User', 'filterBoards'),
    filterLabels: many('Label', 'filterBoards'),
  };

  static reducer({ type, payload }, Board) {
    switch (type) {
      case ActionTypes.USER_TO_BOARD_FILTER_ADD:
        Board.withId(payload.boardId).filterUsers.add(payload.id);

        break;
      case ActionTypes.USER_FROM_BOARD_FILTER_REMOVE:
        Board.withId(payload.boardId).filterUsers.remove(payload.id);

        break;
      case ActionTypes.PROJECTS_FETCH_SUCCEEDED:
      case ActionTypes.PROJECT_CREATE_SUCCEEDED:
      case ActionTypes.PROJECT_CREATE_RECEIVED:
        payload.boards.forEach((board) => {
          Board.upsert(board);
        });

        break;
      case ActionTypes.BOARD_CREATE:
      case ActionTypes.BOARD_CREATE_RECEIVED:
        Board.upsert(payload.board);

        break;
      case ActionTypes.BOARD_UPDATE:
        Board.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.BOARD_DELETE:
        Board.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.BOARD_CREATE_SUCCEEDED:
        Board.withId(payload.localId).delete();
        Board.upsert({
          ...payload.board,
          isFetching: false,
        });

        break;
      case ActionTypes.BOARD_FETCH_REQUESTED:
        Board.withId(payload.id).update({
          isFetching: true,
        });

        break;
      case ActionTypes.BOARD_FETCH_SUCCEEDED:
        Board.withId(payload.board.id).update({
          ...payload.board,
          isFetching: false,
        });

        break;
      case ActionTypes.BOARD_UPDATE_RECEIVED:
        Board.withId(payload.board.id).update(payload.board);

        break;
      case ActionTypes.BOARD_DELETE_RECEIVED:
        Board.withId(payload.board.id).deleteWithRelated();

        break;
      case ActionTypes.LABEL_TO_BOARD_FILTER_ADD:
        Board.withId(payload.boardId).filterLabels.add(payload.id);

        break;
      case ActionTypes.LABEL_FROM_BOARD_FILTER_REMOVE:
        Board.withId(payload.boardId).filterLabels.remove(payload.id);

        break;
      default:
    }
  }

  getOrderedListsQuerySet() {
    return this.lists.orderBy('position');
  }

  deleteWithRelated() {
    this.cards.toModelArray().forEach((cardModel) => {
      cardModel.deleteWithRelated();
    });

    this.delete();
  }
}
