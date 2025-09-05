/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'CustomFieldGroup';

  static fields = {
    id: attr(),
    position: attr(),
    name: attr(),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'customFieldGroups',
    }),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'customFieldGroups',
    }),
    baseCustomFieldGroupId: fk({
      to: 'BaseCustomFieldGroup',
      as: 'baseCustomFieldGroup',
      relatedName: 'customFieldGroups',
    }),
  };

  static reducer({ type, payload }, CustomFieldGroup) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
      case ActionTypes.LIST_UPDATE_HANDLE:
      case ActionTypes.CARD_UPDATE_HANDLE:
        if (payload.customFieldGroups) {
          payload.customFieldGroups.forEach((customFieldGroup) => {
            CustomFieldGroup.upsert(customFieldGroup);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        CustomFieldGroup.all().delete();

        if (payload.customFieldGroups) {
          payload.customFieldGroups.forEach((customFieldGroup) => {
            CustomFieldGroup.upsert(customFieldGroup);
          });
        }

        break;
      case ActionTypes.BOARD_FETCH__SUCCESS:
      case ActionTypes.CARDS_FETCH__SUCCESS:
      case ActionTypes.CARD_CREATE_HANDLE:
      case ActionTypes.CARD_DUPLICATE__SUCCESS:
        payload.customFieldGroups.forEach((customFieldGroup) => {
          CustomFieldGroup.upsert(customFieldGroup);
        });

        break;
      case ActionTypes.CUSTOM_FIELD_GROUP_CREATE:
      case ActionTypes.CUSTOM_FIELD_GROUP_CREATE_HANDLE:
      case ActionTypes.CUSTOM_FIELD_GROUP_UPDATE__SUCCESS:
      case ActionTypes.CUSTOM_FIELD_GROUP_UPDATE_HANDLE:
        CustomFieldGroup.upsert(payload.customFieldGroup);

        break;
      case ActionTypes.CUSTOM_FIELD_GROUP_CREATE__SUCCESS:
        CustomFieldGroup.withId(payload.localId).delete();
        CustomFieldGroup.upsert(payload.customFieldGroup);

        break;
      case ActionTypes.CUSTOM_FIELD_GROUP_CREATE__FAILURE:
        CustomFieldGroup.withId(payload.localId).delete();

        break;
      case ActionTypes.CUSTOM_FIELD_GROUP_UPDATE:
        CustomFieldGroup.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.CUSTOM_FIELD_GROUP_DELETE:
        CustomFieldGroup.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.CUSTOM_FIELD_GROUP_DELETE__SUCCESS:
      case ActionTypes.CUSTOM_FIELD_GROUP_DELETE_HANDLE: {
        const customFieldGroupModel = CustomFieldGroup.withId(payload.customFieldGroup.id);

        if (customFieldGroupModel) {
          customFieldGroupModel.deleteWithRelated();
        }

        break;
      }
      default:
    }
  }

  getCustomFieldsQuerySet() {
    return this.customFields.orderBy(['position', 'id.length', 'id']);
  }

  getCustomFieldsModelArray() {
    if (this.baseCustomFieldGroupId) {
      return this.baseCustomFieldGroup.getCustomFieldsQuerySet().toModelArray();
    }

    return this.getCustomFieldsQuerySet().toModelArray();
  }

  getShownOnFrontOfCardCustomFieldsModelArray() {
    return this.getCustomFieldsModelArray().filter(
      (customFieldModel) => customFieldModel.showOnFrontOfCard,
    );
  }

  duplicate(id, data, rootId) {
    if (rootId === undefined) {
      rootId = id; // eslint-disable-line no-param-reassign
    }

    const customFieldGroupModel = this.getClass().create({
      id,
      boardId: this.boardId,
      cardId: this.cardId,
      baseCustomFieldGroupId: this.baseCustomFieldGroupId,
      position: this.position,
      name: this.name,
      ...data,
    });

    this.customFields.toModelArray().forEach((customFieldModel) => {
      customFieldModel.duplicate(
        `${customFieldModel.id}-${rootId}`,
        {
          customFieldGroupId: customFieldGroupModel.id,
        },
        rootId,
      );
    });

    return customFieldGroupModel;
  }

  deleteRelated() {
    this.customFields.delete();
    this.customFieldValues.delete();
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
