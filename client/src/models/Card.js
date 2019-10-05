import {
  Model, attr, fk, many,
} from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import Config from '../constants/Config';

export default class extends Model {
  static modelName = 'Card';

  static fields = {
    id: attr(),
    position: attr(),
    name: attr(),
    description: attr(),
    dueDate: attr(),
    timer: attr(),
    isSubscribed: attr({
      getDefault: () => false,
    }),
    isActionsFetching: attr({
      getDefault: () => false,
    }),
    isAllActionsFetched: attr({
      getDefault: () => false,
    }),
    listId: fk({
      to: 'List',
      as: 'list',
      relatedName: 'cards',
    }),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'cards',
    }),
    users: many('User', 'cards'),
    labels: many('Label', 'cards'),
  };

  static reducer({ type, payload }, Card) {
    switch (type) {
      case ActionTypes.USER_TO_CARD_ADD: {
        const cardModel = Card.withId(payload.cardId);
        cardModel.users.add(payload.id);

        if (payload.isCurrent) {
          cardModel.isSubscribed = true;
        }

        break;
      }
      case ActionTypes.USER_FROM_CARD_REMOVE:
        Card.withId(payload.cardId).users.remove(payload.id);

        break;
      case ActionTypes.BOARD_FETCH_SUCCEEDED:
        payload.cards.forEach((card) => {
          Card.upsert(card);
        });

        payload.cardMemberships.forEach(({ cardId, userId }) => {
          Card.withId(cardId).users.add(userId);
        });

        payload.cardLabels.forEach(({ cardId, labelId }) => {
          Card.withId(cardId).labels.add(labelId);
        });

        break;
      case ActionTypes.LABEL_TO_CARD_ADD:
        Card.withId(payload.cardId).labels.add(payload.id);

        break;
      case ActionTypes.LABEL_FROM_CARD_REMOVE:
        Card.withId(payload.cardId).labels.remove(payload.id);

        break;
      case ActionTypes.CARD_CREATE:
      case ActionTypes.CARD_CREATE_RECEIVED:
      case ActionTypes.CARD_FETCH_SUCCEEDED:
      case ActionTypes.NOTIFICATION_CREATE_RECEIVED:
        Card.upsert(payload.card);

        break;
      case ActionTypes.CARD_UPDATE:
        Card.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.CARD_DELETE:
        Card.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.CARD_CREATE_SUCCEEDED:
        Card.withId(payload.localId).delete();
        Card.upsert(payload.card);

        break;
      case ActionTypes.CARD_UPDATE_RECEIVED:
        Card.withId(payload.card.id).update(payload.card);

        break;
      case ActionTypes.CARD_DELETE_RECEIVED:
        Card.withId(payload.card.id).deleteWithRelated();

        break;
      case ActionTypes.CARD_MEMBERSHIP_CREATE_RECEIVED:
        Card.withId(payload.cardMembership.cardId).users.add(payload.cardMembership.userId);

        break;
      case ActionTypes.CARD_MEMBERSHIP_DELETE_RECEIVED:
        Card.withId(payload.cardMembership.cardId).users.remove(payload.cardMembership.userId);

        break;
      case ActionTypes.CARD_LABEL_CREATE_RECEIVED:
        Card.withId(payload.cardLabel.cardId).labels.add(payload.cardLabel.labelId);

        break;
      case ActionTypes.CARD_LABEL_DELETE_RECEIVED:
        Card.withId(payload.cardLabel.cardId).labels.remove(payload.cardLabel.labelId);

        break;
      case ActionTypes.ACTIONS_FETCH_REQUESTED:
        Card.withId(payload.cardId).update({
          isActionsFetching: true,
        });

        break;
      case ActionTypes.ACTIONS_FETCH_SUCCEEDED:
        Card.withId(payload.cardId).update({
          isActionsFetching: false,
          isAllActionsFetched: payload.actions.length < Config.ACTIONS_LIMIT,
        });

        break;
      case ActionTypes.NOTIFICATIONS_FETCH_SUCCEEDED:
        payload.cards.forEach((card) => {
          Card.upsert(card);
        });

        break;
      default:
    }
  }

  getOrderedTasksQuerySet() {
    return this.tasks.orderBy('id');
  }

  getOrderedInCardActionsQuerySet() {
    return this.actions.orderBy('id', false);
  }

  getUnreadNotificationsQuerySet() {
    return this.notifications.filter({
      isRead: false,
    });
  }

  deleteWithRelated() {
    this.tasks.delete();
    this.actions.delete();

    this.delete();
  }
}
