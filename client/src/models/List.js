import { Model, attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';

export default class extends Model {
  static modelName = 'List';

  static fields = {
    id: attr(),
    position: attr(),
    name: attr(),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'lists',
    }),
  };

  static reducer({ type, payload }, List) {
    switch (type) {
      case ActionTypes.BOARD_CREATE_SUCCEEDED:
      case ActionTypes.BOARD_CREATE_RECEIVED:
      case ActionTypes.BOARD_FETCH_SUCCEEDED:
        payload.lists.forEach((list) => {
          List.upsert(list);
        });

        break;
      case ActionTypes.LIST_CREATE:
      case ActionTypes.LIST_CREATE_RECEIVED:
        List.upsert(payload.list);

        break;
      case ActionTypes.LIST_UPDATE:
        List.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.LIST_DELETE:
        List.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.LIST_CREATE_SUCCEEDED:
        List.withId(payload.localId).delete();
        List.upsert(payload.list);

        break;
      case ActionTypes.LIST_UPDATE_RECEIVED:
        List.withId(payload.list.id).update(payload.list);

        break;
      case ActionTypes.LIST_DELETE_RECEIVED:
        List.withId(payload.list.id).deleteWithRelated();

        break;
      default:
    }
  }

  getOrderedCardsQuerySet() {
    return this.cards.orderBy('position');
  }

  getOrderedFilteredCardsModelArray() {
    let cardModels = this.getOrderedCardsQuerySet().toModelArray();

    const filterUserIds = this.board.filterUsers.toRefArray().map((user) => user.id);
    const filterLabelIds = this.board.filterLabels.toRefArray().map((label) => label.id);

    if (filterUserIds.length > 0) {
      cardModels = cardModels.filter((cardModel) => {
        const users = cardModel.users.toRefArray();

        return users.some((user) => filterUserIds.includes(user.id));
      });
    }

    if (filterLabelIds.length > 0) {
      cardModels = cardModels.filter((cardModel) => {
        const labels = cardModel.labels.toRefArray();

        return labels.some((label) => filterLabelIds.includes(label.id));
      });
    }

    return cardModels;
  }

  deleteWithRelated() {
    this.cards.toModelArray().forEach((cardModel) => {
      cardModel.deleteWithRelated();
    });

    this.delete();
  }
}
