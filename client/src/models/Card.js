/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk, many, oneToOne } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';
import Config from '../constants/Config';

export default class extends BaseModel {
  static modelName = 'Card';

  static fields = {
    id: attr(),
    type: attr(),
    position: attr(),
    name: attr(),
    description: attr(),
    dueDate: attr(),
    stopwatch: attr(),
    isClosed: attr(),
    commentsTotal: attr({
      getDefault: () => 0,
    }),
    createdAt: attr({
      getDefault: () => new Date(),
    }),
    listChangedAt: attr({
      getDefault: () => new Date(),
    }),
    isSubscribed: attr({
      getDefault: () => false,
    }),
    lastCommentId: attr({
      getDefault: () => null,
    }),
    isCommentsFetching: attr({
      getDefault: () => false,
    }),
    isAllCommentsFetched: attr({
      getDefault: () => null,
    }),
    lastActivityId: attr({
      getDefault: () => null,
    }),
    isActivitiesFetching: attr({
      getDefault: () => false,
    }),
    isAllActivitiesFetched: attr({
      getDefault: () => null,
    }),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'cards',
    }),
    listId: fk({
      to: 'List',
      as: 'list',
      relatedName: 'cards',
    }),
    creatorUserId: fk({
      to: 'User',
      as: 'creatorUser',
      relatedName: 'createdCards',
    }),
    prevListId: fk({
      to: 'List',
      as: 'prevList',
      relatedName: 'prevCards',
    }),
    coverAttachmentId: oneToOne({
      to: 'Attachment',
      as: 'coverAttachment',
      relatedName: 'coveredCard',
    }),
    users: many('User', 'cards'),
    labels: many('Label', 'cards'),
  };

  static reducer({ type, payload }, Card) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.cards) {
          payload.cards.forEach((card) => {
            Card.upsert(card);
          });
        }

        if (payload.cardMemberships) {
          payload.cardMemberships.forEach(({ cardId, userId }) => {
            Card.withId(cardId).users.add(userId);
          });
        }

        if (payload.cardLabels) {
          payload.cardLabels.forEach(({ cardId, labelId }) => {
            Card.withId(cardId).labels.add(labelId);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Card.all()
          .toModelArray()
          .forEach((cardModel) => {
            cardModel.deleteWithClearable();
          });

        if (payload.cards) {
          payload.cards.forEach((card) => {
            Card.upsert(card);
          });
        }

        if (payload.cardMemberships) {
          payload.cardMemberships.forEach(({ cardId, userId }) => {
            Card.withId(cardId).users.add(userId);
          });
        }

        if (payload.cardLabels) {
          payload.cardLabels.forEach(({ cardId, labelId }) => {
            Card.withId(cardId).labels.add(labelId);
          });
        }

        break;
      case ActionTypes.USER_TO_CARD_ADD: {
        const cardModel = Card.withId(payload.cardId);
        cardModel.users.add(payload.id);

        if (payload.isCurrent) {
          cardModel.isSubscribed = true;
        }

        break;
      }
      case ActionTypes.USER_TO_CARD_ADD__SUCCESS:
      case ActionTypes.USER_TO_CARD_ADD_HANDLE:
        try {
          Card.withId(payload.cardMembership.cardId).users.add(payload.cardMembership.userId);
        } catch {
          /* empty */
        }

        break;
      case ActionTypes.USER_FROM_CARD_REMOVE:
        Card.withId(payload.cardId).users.remove(payload.id);

        break;
      case ActionTypes.USER_FROM_CARD_REMOVE__SUCCESS:
      case ActionTypes.USER_FROM_CARD_REMOVE_HANDLE:
        try {
          Card.withId(payload.cardMembership.cardId).users.remove(payload.cardMembership.userId);
        } catch {
          /* empty */
        }

        break;
      case ActionTypes.BOARD_FETCH__SUCCESS:
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
      case ActionTypes.LABEL_FROM_CARD_CREATE:
        Card.withId(payload.cardId).labels.add(payload.label.id);

        break;
      case ActionTypes.LABEL_FROM_CARD_CREATE__SUCCESS: {
        const cardModel = Card.withId(payload.cardLabel.cardId);

        cardModel.labels.remove(payload.localId);
        cardModel.labels.add(payload.label.id);

        break;
      }
      case ActionTypes.LABEL_FROM_CARD_CREATE__FAILURE:
        Card.withId(payload.cardId).labels.remove(payload.localId);

        break;
      case ActionTypes.LABEL_TO_CARD_ADD:
        Card.withId(payload.cardId).labels.add(payload.id);

        break;
      case ActionTypes.LABEL_TO_CARD_ADD__SUCCESS:
      case ActionTypes.LABEL_TO_CARD_ADD_HANDLE:
        try {
          Card.withId(payload.cardLabel.cardId).labels.add(payload.cardLabel.labelId);
        } catch {
          /* empty */
        }

        break;
      case ActionTypes.LABEL_FROM_CARD_REMOVE:
        Card.withId(payload.cardId).labels.remove(payload.id);

        break;
      case ActionTypes.LABEL_FROM_CARD_REMOVE__SUCCESS:
      case ActionTypes.LABEL_FROM_CARD_REMOVE_HANDLE:
        try {
          Card.withId(payload.cardLabel.cardId).labels.remove(payload.cardLabel.labelId);
        } catch {
          /* empty */
        }

        break;
      case ActionTypes.LIST_SORT__SUCCESS:
      case ActionTypes.LIST_CARDS_MOVE__SUCCESS:
      case ActionTypes.LIST_DELETE__SUCCESS:
      case ActionTypes.CARDS_UPDATE_HANDLE:
        payload.cards.forEach((card) => {
          Card.upsert(card);
        });

        break;
      case ActionTypes.LIST_CARDS_MOVE: {
        const listChangedAt = new Date();

        payload.cardIds.forEach((cardId) => {
          const cardModel = Card.withId(cardId);

          cardModel.update({
            listChangedAt,
            listId: payload.nextId,
            prevListId: cardModel.listId,
          });
        });

        break;
      }
      case ActionTypes.LIST_DELETE: {
        const listChangedAt = new Date();

        payload.cardIds.forEach((cardId) => {
          Card.withId(cardId).update({
            listChangedAt,
            listId: payload.trashId,
          });
        });

        break;
      }
      case ActionTypes.LIST_DELETE_HANDLE:
        if (payload.cards) {
          payload.cards.forEach((card) => {
            Card.upsert(card);
          });
        }

        break;
      case ActionTypes.CARDS_FETCH__SUCCESS:
        payload.cards.forEach((card) => {
          const cardModel = Card.withId(card.id);

          if (cardModel) {
            cardModel.deleteWithRelated();
          }

          Card.upsert(card);
        });

        payload.cardMemberships.forEach(({ cardId, userId }) => {
          Card.withId(cardId).users.add(userId);
        });

        payload.cardLabels.forEach(({ cardId, labelId }) => {
          Card.withId(cardId).labels.add(labelId);
        });

        break;
      case ActionTypes.CARD_CREATE:
      case ActionTypes.CARD_UPDATE__SUCCESS:
        Card.upsert(payload.card);

        break;
      case ActionTypes.CARD_CREATE__SUCCESS:
        Card.withId(payload.localId).deleteWithClearable();
        Card.upsert(payload.card);

        break;
      case ActionTypes.CARD_CREATE__FAILURE:
        Card.withId(payload.localId).deleteWithClearable();

        break;
      case ActionTypes.CARD_CREATE_HANDLE:
        Card.upsert(payload.card);

        payload.cardMemberships.forEach(({ cardId, userId }) => {
          Card.withId(cardId).users.add(userId);
        });

        payload.cardLabels.forEach(({ cardId, labelId }) => {
          Card.withId(cardId).labels.add(labelId);
        });

        break;
      case ActionTypes.CARD_UPDATE: {
        const cardModel = Card.withId(payload.id);

        // TODO: introduce separate action?
        if (payload.data.boardId && payload.data.boardId !== cardModel.boardId) {
          cardModel.deleteWithRelated();
        } else {
          if (payload.data.listId && payload.data.listId !== cardModel.listId) {
            payload.data.listChangedAt = new Date(); // eslint-disable-line no-param-reassign
          }

          if (payload.data.isClosed !== undefined && payload.data.isClosed !== cardModel.isClosed) {
            cardModel.linkedTasks.update({
              isCompleted: payload.data.isClosed,
            });
          }

          cardModel.update(payload.data);
        }

        break;
      }
      case ActionTypes.CARD_UPDATE_HANDLE: {
        const cardModel = Card.withId(payload.card.id);

        if (payload.card.boardId === null || payload.isFetched) {
          if (cardModel) {
            cardModel.deleteWithRelated();
          }
        }

        if (payload.card.boardId !== null) {
          Card.upsert(payload.card);

          if (cardModel && payload.card.isClosed !== cardModel.isClosed) {
            cardModel.linkedTasks.update({
              isCompleted: payload.card.isClosed,
            });
          }
        }

        if (payload.cardMemberships) {
          payload.cardMemberships.forEach(({ cardId, userId }) => {
            Card.withId(cardId).users.add(userId);
          });
        }

        if (payload.cardLabels) {
          payload.cardLabels.forEach(({ cardId, labelId }) => {
            Card.withId(cardId).labels.add(labelId);
          });
        }

        break;
      }
      case ActionTypes.CARD_DUPLICATE:
        Card.withId(payload.id).duplicate(payload.localId, payload.data);

        break;
      case ActionTypes.CARD_DUPLICATE__SUCCESS: {
        Card.withId(payload.localId).deleteWithRelated();

        const cardModel = Card.upsert(payload.card);

        payload.cardMemberships.forEach(({ userId }) => {
          cardModel.users.add(userId);
        });

        payload.cardLabels.forEach(({ labelId }) => {
          cardModel.labels.add(labelId);
        });

        break;
      }
      case ActionTypes.CARD_DUPLICATE__FAILURE:
        Card.withId(payload.localId).deleteWithRelated();

        break;
      case ActionTypes.CARD_DELETE:
        Card.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.CARD_DELETE__SUCCESS:
      case ActionTypes.CARD_DELETE_HANDLE: {
        const cardModel = Card.withId(payload.card.id);

        if (cardModel) {
          cardModel.deleteWithRelated();
        }

        break;
      }
      case ActionTypes.COMMENTS_FETCH:
        Card.withId(payload.cardId).update({
          isCommentsFetching: true,
        });

        break;
      case ActionTypes.COMMENTS_FETCH__SUCCESS:
        Card.withId(payload.cardId).update({
          isCommentsFetching: false,
          isAllCommentsFetched: payload.comments.length < Config.COMMENTS_LIMIT,
          ...(payload.comments.length > 0 && {
            lastCommentId: payload.comments[payload.comments.length - 1].id,
          }),
        });

        break;
      case ActionTypes.COMMENT_CREATE:
      case ActionTypes.COMMENT_CREATE_HANDLE: {
        const cardModel = Card.withId(payload.comment.cardId);

        if (cardModel) {
          cardModel.commentsTotal += 1;
        }

        break;
      }
      case ActionTypes.COMMENT_DELETE_HANDLE: {
        const cardModel = Card.withId(payload.comment.cardId);

        if (cardModel) {
          cardModel.commentsTotal -= 1;
        }

        break;
      }
      case ActionTypes.ACTIVITIES_IN_CARD_FETCH:
        Card.withId(payload.cardId).update({
          isActivitiesFetching: true,
        });

        break;
      case ActionTypes.ACTIVITIES_IN_CARD_FETCH__SUCCESS:
        Card.withId(payload.cardId).update({
          isActivitiesFetching: false,
          isAllActivitiesFetched: payload.activities.length < Config.ACTIVITIES_LIMIT,
          ...(payload.activities.length > 0 && {
            lastActivityId: payload.activities[payload.activities.length - 1].id,
          }),
        });

        break;
      default:
    }
  }

  getTaskListsQuerySet() {
    return this.taskLists.orderBy(['position', 'id.length', 'id']);
  }

  getAttachmentsQuerySet() {
    return this.attachments.orderBy(['id.length', 'id'], ['desc', 'desc']);
  }

  getCustomFieldGroupsQuerySet() {
    return this.customFieldGroups.orderBy(['position', 'id.length', 'id']);
  }

  getCommentsQuerySet() {
    return this.comments.orderBy(['id.length', 'id'], ['desc', 'desc']);
  }

  getActivitiesQuerySet() {
    return this.activities.orderBy(['id.length', 'id'], ['desc', 'desc']);
  }

  getUnreadNotificationsQuerySet() {
    return this.notifications.filter({
      isRead: false,
    });
  }

  getShownOnFrontOfCardTaskListsModelArray() {
    return this.getTaskListsQuerySet()
      .toModelArray()
      .filter((taskListModel) => taskListModel.showOnFrontOfCard);
  }

  getCommentsModelArray() {
    if (this.isAllCommentsFetched === null) {
      return [];
    }

    const commentModels = this.getCommentsQuerySet().toModelArray();

    if (this.lastCommentId && this.isAllCommentsFetched === false) {
      return commentModels.filter((commentModel) => {
        if (commentModel.id.length > this.lastCommentId.length) {
          return true;
        }

        if (commentModel.id.length < this.lastCommentId.length) {
          return false;
        }

        return commentModel.id >= this.lastCommentId;
      });
    }

    return commentModels;
  }

  getActivitiesModelArray() {
    if (this.isAllActivitiesFetched === null) {
      return [];
    }

    const activityModels = this.getActivitiesQuerySet().toModelArray();

    if (this.lastActivityId && this.isAllActivitiesFetched === false) {
      return activityModels.filter((activityModel) => {
        if (activityModel.id.length > this.lastActivityId.length) {
          return true;
        }

        if (activityModel.id.length < this.lastActivityId.length) {
          return false;
        }

        return activityModel.id >= this.lastActivityId;
      });
    }

    return activityModels;
  }

  hasUserWithId(userId) {
    return this.cardusersSet
      .filter({
        toUserId: userId,
      })
      .exists();
  }

  isAvailableForUser(userModel) {
    return !!this.list && this.list.isAvailableForUser(userModel);
  }

  duplicate(id, data, rootId) {
    if (rootId === undefined) {
      rootId = id; // eslint-disable-line no-param-reassign
    }

    const cardModel = this.getClass().create({
      id,
      boardId: this.boardId,
      listId: this.listId,
      creatorUserId: this.creatorUserId,
      prevListId: this.prevListId,
      coverAttachmentId: this.coverAttachmentId && `${this.coverAttachmentId}-${rootId}`,
      type: this.type,
      position: this.position,
      name: this.name,
      description: this.description,
      dueDate: this.dueDate,
      stopwatch: this.stopwatch,
      isClosed: this.isClosed,
      ...data,
    });

    this.users.toRefArray().forEach((user) => {
      cardModel.users.add(user.id);
    });

    this.labels.toRefArray().forEach((label) => {
      cardModel.labels.add(label.id);
    });

    this.taskLists.toModelArray().forEach((taskListModel) => {
      taskListModel.duplicate(`${taskListModel.id}-${rootId}`, {
        cardId: cardModel.id,
      });
    });

    this.attachments.toModelArray().forEach((attachmentModel) => {
      attachmentModel.duplicate(`${attachmentModel.id}-${rootId}`, {
        cardId: cardModel.id,
        ...(data.creatorUserId && {
          creatorUserId: data.creatorUserId,
        }),
      });
    });

    this.customFieldGroups.toModelArray().forEach((customFieldGroupModel) => {
      customFieldGroupModel.duplicate(
        `${customFieldGroupModel.id}-${rootId}`,
        {
          cardId: cardModel.id,
        },
        rootId,
      );
    });

    this.customFieldValues.toModelArray().forEach((customFieldValueModel) => {
      const customFieldValueData = {
        cardId: cardModel.id,
      };

      if (customFieldValueModel.customFieldGroup.cardId) {
        customFieldValueData.customFieldGroupId = `${customFieldValueModel.customFieldGroupId}-${rootId}`;

        if (customFieldValueModel.customField.customFieldGroupId) {
          customFieldValueData.customFieldId = `${customFieldValueModel.customFieldId}-${rootId}`;
        }
      }

      customFieldValueModel.duplicate(customFieldValueData);
    });

    return cardModel;
  }

  deleteClearable() {
    this.users.clear();
    this.labels.clear();
  }

  deleteRelated() {
    this.deleteClearable();

    this.taskLists.toModelArray().forEach((taskListModel) => {
      taskListModel.deleteWithRelated();
    });

    this.linkedTasks.toModelArray().forEach((taskModel) => {
      taskModel.update({
        linkedCardId: null,
      });
    });

    this.attachments.delete();

    this.customFieldGroups.toModelArray().forEach((customFieldGroupModel) => {
      customFieldGroupModel.deleteWithRelated();
    });

    this.customFieldValues.delete();
    this.comments.delete();
  }

  deleteWithClearable() {
    this.deleteClearable();
    this.delete();
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
