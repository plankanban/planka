/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import buildSearchParts from '../utils/build-search-parts';
import { isListFinite } from '../utils/record-helpers';
import ActionTypes from '../constants/ActionTypes';
import Config from '../constants/Config';
import { ListSortFieldNames, ListTypes, SortOrders } from '../constants/Enums';

const POSITION_BY_LIST_TYPE = {
  [ListTypes.ARCHIVE]: Number.MAX_SAFE_INTEGER - 1,
  [ListTypes.TRASH]: Number.MAX_SAFE_INTEGER,
};

const prepareList = (list) => {
  if (list.position === undefined) {
    return list;
  }

  return {
    ...list,
    position: list.position === null ? POSITION_BY_LIST_TYPE[list.type] : list.position,
  };
};

export default class extends BaseModel {
  static modelName = 'List';

  static fields = {
    id: attr(),
    type: attr(),
    position: attr(),
    name: attr(),
    color: attr(),
    lastCard: attr({
      getDefault: () => null,
    }),
    isCardsFetching: attr({
      getDefault: () => false,
    }),
    isAllCardsFetched: attr({
      getDefault: () => null,
    }),
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
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.lists) {
          payload.lists.forEach((list) => {
            List.upsert(prepareList(list));
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        List.all().delete();

        if (payload.lists) {
          payload.lists.forEach((list) => {
            List.upsert(prepareList(list));
          });
        }

        break;
      case ActionTypes.USER_TO_BOARD_FILTER_ADD:
      case ActionTypes.USER_FROM_BOARD_FILTER_REMOVE:
      case ActionTypes.IN_BOARD_SEARCH:
      case ActionTypes.LABEL_TO_BOARD_FILTER_ADD:
      case ActionTypes.LABEL_FROM_BOARD_FILTER_REMOVE:
        if (payload.currentListId) {
          List.withId(payload.currentListId).update({
            lastCard: null,
            isCardsFetching: false,
            isAllCardsFetched: null,
          });
        }

        break;
      case ActionTypes.BOARD_FETCH__SUCCESS:
        payload.lists.forEach((list) => {
          List.upsert(prepareList(list));
        });

        break;
      case ActionTypes.LIST_CREATE:
      case ActionTypes.LIST_CREATE_HANDLE:
      case ActionTypes.LIST_UPDATE__SUCCESS:
      case ActionTypes.LIST_SORT__SUCCESS:
      case ActionTypes.LIST_CARDS_MOVE__SUCCESS:
      case ActionTypes.LIST_CLEAR__SUCCESS:
        List.upsert(prepareList(payload.list));

        break;
      case ActionTypes.LIST_CREATE__SUCCESS:
        List.withId(payload.localId).delete();
        List.upsert(prepareList(payload.list));

        break;
      case ActionTypes.LIST_CREATE__FAILURE:
        List.withId(payload.localId).delete();

        break;
      case ActionTypes.LIST_UPDATE: {
        const listModel = List.withId(payload.id);

        let isClosed;
        if (payload.data.type) {
          if (payload.data.type === ListTypes.CLOSED) {
            if (listModel.type === ListTypes.ACTIVE) {
              isClosed = true;
            }
          } else if (listModel.type === ListTypes.CLOSED) {
            isClosed = false;
          }
        }

        listModel.update(payload.data);

        if (isClosed !== undefined) {
          listModel.cards.toModelArray().forEach((cardModel) => {
            cardModel.update({
              isClosed,
            });
          });
        }

        break;
      }
      case ActionTypes.LIST_UPDATE_HANDLE: {
        const listModel = List.withId(payload.list.id);

        if (listModel) {
          let isClosed;
          if (payload.list.type === ListTypes.CLOSED) {
            if (listModel.type === ListTypes.ACTIVE) {
              isClosed = true;
            }
          } else if (listModel.type === ListTypes.CLOSED) {
            isClosed = false;
          }

          listModel.update(prepareList(payload.list));

          if (isClosed !== undefined) {
            listModel.cards.toModelArray().forEach((cardModel) => {
              cardModel.update({
                isClosed,
              });
            });
          }
        } else {
          List.upsert(prepareList(payload.list));
        }

        break;
      }
      case ActionTypes.LIST_SORT:
        List.withId(payload.id).sortCards(payload.data);

        break;
      case ActionTypes.LIST_CLEAR:
        List.withId(payload.id).deleteRelated();

        break;
      case ActionTypes.LIST_CLEAR_HANDLE: {
        const listModel = List.withId(payload.list.id);

        if (listModel) {
          listModel.deleteRelated();
        }

        List.upsert(prepareList(payload.list));

        break;
      }
      case ActionTypes.LIST_DELETE:
        List.withId(payload.id).delete();

        break;
      case ActionTypes.LIST_DELETE__SUCCESS: {
        const listModel = List.withId(payload.list.id);

        if (listModel) {
          listModel.delete();
        }

        break;
      }
      case ActionTypes.LIST_DELETE_HANDLE: {
        const listModel = List.withId(payload.list.id);

        if (listModel) {
          if (payload.cards) {
            listModel.delete();
          } else {
            listModel.deleteWithRelated();
          }
        }

        break;
      }
      case ActionTypes.CARDS_FETCH:
        List.withId(payload.listId).update({
          isCardsFetching: true,
        });

        break;
      case ActionTypes.CARDS_FETCH__SUCCESS: {
        const lastCard = payload.cards[payload.cards.length - 1];

        List.withId(payload.listId).update({
          isCardsFetching: false,
          isAllCardsFetched: payload.cards.length < Config.CARDS_LIMIT,
          ...(lastCard && {
            lastCard: {
              listChangedAt: lastCard.listChangedAt,
              id: lastCard.id,
            },
          }),
        });

        break;
      }
      default:
    }
  }

  getCardsQuerySet() {
    const orderByArgs = isListFinite(this)
      ? [['position', 'id.length', 'id']]
      : [
          ['listChangedAt', 'id.length', 'id'],
          ['desc', 'desc', 'desc'],
        ];

    return this.cards.orderBy(...orderByArgs);
  }

  getCardsModelArray() {
    const isFinite = isListFinite(this);

    if (!isFinite && this.isAllCardsFetched === null) {
      return [];
    }

    const cardModels = this.getCardsQuerySet().toModelArray();

    if (!isFinite && this.lastCard && this.isAllCardsFetched === false) {
      return cardModels.filter((cardModel) => {
        if (cardModel.listChangedAt > this.lastCard.listChangedAt) {
          return true;
        }

        if (cardModel.listChangedAt < this.lastCard.listChangedAt) {
          return false;
        }

        if (cardModel.id.length > this.lastCard.id.length) {
          return true;
        }

        if (cardModel.id.length < this.lastCard.id.length) {
          return false;
        }

        return cardModel.id >= this.lastCard.id;
      });
    }

    return cardModels;
  }

  getFilteredCardsModelArray() {
    let cardModels = this.getCardsModelArray();

    if (cardModels.length === 0) {
      return cardModels;
    }

    if (this.board.search) {
      if (this.board.search.startsWith('/')) {
        let searchRegex;
        try {
          searchRegex = new RegExp(this.board.search.substring(1), 'i');
        } catch {
          return [];
        }

        if (searchRegex) {
          cardModels = cardModels.filter(
            (cardModel) =>
              searchRegex.test(cardModel.name) ||
              (cardModel.description && searchRegex.test(cardModel.description)),
          );
        }
      } else {
        const searchParts = buildSearchParts(this.board.search);

        cardModels = cardModels.filter((cardModel) => {
          const name = cardModel.name.toLowerCase();
          const description = cardModel.description && cardModel.description.toLowerCase();

          return searchParts.every(
            (searchPart) =>
              name.includes(searchPart) || (description && description.includes(searchPart)),
          );
        });
      }
    }

    const filterUserIds = this.board.filterUsers.toRefArray().map((user) => user.id);

    if (filterUserIds.length > 0) {
      cardModels = cardModels.filter((cardModel) => {
        const users = cardModel.users.toRefArray();

        if (users.some((user) => filterUserIds.includes(user.id))) {
          return true;
        }

        return cardModel
          .getTaskListsQuerySet()
          .toModelArray()
          .some((taskListModel) =>
            taskListModel
              .getTasksQuerySet()
              .toRefArray()
              .some((task) => task.assigneeUserId && filterUserIds.includes(task.assigneeUserId)),
          );
      });
    }

    const filterLabelIds = this.board.filterLabels.toRefArray().map((label) => label.id);

    if (filterLabelIds.length > 0) {
      cardModels = cardModels.filter((cardModel) => {
        const labels = cardModel.labels.toRefArray();
        return labels.some((label) => filterLabelIds.includes(label.id));
      });
    }

    return cardModels;
  }

  isAvailableForUser(userModel) {
    return !!this.board && this.board.isAvailableForUser(userModel);
  }

  sortCards(options) {
    const cardModels = this.getCardsQuerySet().toModelArray();

    switch (options.fieldName) {
      case ListSortFieldNames.NAME:
        cardModels.sort((card1, card2) => card1.name.localeCompare(card2.name));

        break;
      case ListSortFieldNames.DUE_DATE:
        cardModels.sort((card1, card2) => {
          if (card1.dueDate === null) {
            return 1;
          }

          if (card2.dueDate === null) {
            return -1;
          }

          return card1.dueDate - card2.dueDate;
        });

        break;
      case ListSortFieldNames.CREATED_AT:
        cardModels.sort((card1, card2) => card1.createdAt - card2.createdAt);

        break;
      default:
        break;
    }

    if (options.order === SortOrders.DESC) {
      cardModels.reverse();
    }

    cardModels.forEach((cardModel, index) => {
      cardModel.update({
        position: Config.POSITION_GAP * (index + 1),
      });
    });
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
