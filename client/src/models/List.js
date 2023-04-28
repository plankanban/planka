import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
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
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.lists) {
          payload.lists.forEach((list) => {
            List.upsert(list);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        List.all().delete();

        if (payload.lists) {
          payload.lists.forEach((list) => {
            List.upsert(list);
          });
        }

        break;
      case ActionTypes.BOARD_FETCH__SUCCESS:
        payload.lists.forEach((list) => {
          List.upsert(list);
        });

        break;
      case ActionTypes.LIST_CREATE:
      case ActionTypes.LIST_CREATE_HANDLE:
      case ActionTypes.LIST_UPDATE__SUCCESS:
      case ActionTypes.LIST_UPDATE_HANDLE:
        List.upsert(payload.list);

        break;
      case ActionTypes.LIST_CREATE__SUCCESS:
        List.withId(payload.localId).delete();
        List.upsert(payload.list);

        break;
      case ActionTypes.LIST_UPDATE:
        List.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.LIST_DELETE:
        List.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.LIST_DELETE__SUCCESS:
      case ActionTypes.LIST_DELETE_HANDLE: {
        const listModel = List.withId(payload.list.id);

        if (listModel) {
          listModel.deleteWithRelated();
        }

        break;
      }
      case ActionTypes.LIST_SORT:
        List.withId(payload.id).sortList();
        break;
      case ActionTypes.LIST_SORT__SUCCESS:
      case ActionTypes.LIST_SORT_HANDLE: {
        const listModel = List.withId(payload.list.id);

        if (listModel) {
          listModel.sortList();
        }

        break;
      }
      default:
    }
  }

  getOrderedByIdCardsQuerySet() {
    return this.cards.orderBy('id');
  }

  getOrderedByPositionCardsQuerySet() {
    return this.cards.orderBy('position');
  }

  getOrderedByTitelCardsQuerySet() {
    return this.cards.orderBy('name');
  }

  getOrderedByCreatedAtCardsQuerySet() {
    return this.cards.orderBy('createdAt');
  }

  getOrderedByUpdatedAtCardsQuerySet() {
    return this.cards.orderBy('updatedAt');
  }

  getOrderedByDueDateCardsQuerySet() {
    return this.cards.orderBy('dueDate');
  }

  getFilteredOrderedCardsModelArray() {
    const sortby = this.selectedOption;

    let cardModels = null;

    switch (sortby) {
      case 'name':
        cardModels = this.getOrderedByTitelCardsQuerySet().toModelArray();
        break;
      case 'id':
        cardModels = this.getOrderedByIdCardsQuerySet().toModelArray();
        break;
      case 'position':
        cardModels = this.getOrderedByPositionCardsQuerySet().toModelArray();
        break;
      case 'createdAt':
        cardModels = this.getOrderedByCreatedAtCardsQuerySet().toModelArray();
        break;
      case 'updatedAt':
        cardModels = this.getOrderedByUpdatedAtCardsQuerySet().toModelArray();
        break;
      case 'dueDate':
        cardModels = this.getOrderedByDueDateCardsQuerySet().toModelArray();
        break;
      case 'creatorUserId':
        cardModels = this.getOrderedByDueDateCardsQuerySet().toModelArray();
        break;
      default:
        cardModels = this.getOrderedByPositionCardsQuerySet().toModelArray();
    }

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

  deleteRelated() {
    this.cards.toModelArray().forEach((cardModel) => {
      cardModel.deleteWithRelated();
    });
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
