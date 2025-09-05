/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'CustomField';

  static fields = {
    id: attr(),
    position: attr(),
    name: attr(),
    showOnFrontOfCard: attr(),
    baseCustomFieldGroupId: fk({
      to: 'BaseCustomFieldGroup',
      as: 'baseGroup',
      relatedName: 'customFields',
    }),
    customFieldGroupId: fk({
      to: 'CustomFieldGroup',
      as: 'group',
      relatedName: 'customFields',
    }),
  };

  static reducer({ type, payload }, CustomField) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
      case ActionTypes.LIST_UPDATE_HANDLE:
      case ActionTypes.CARD_UPDATE_HANDLE:
        if (payload.customFields) {
          payload.customFields.forEach((customField) => {
            CustomField.upsert(customField);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        CustomField.all().delete();

        if (payload.customFields) {
          payload.customFields.forEach((customField) => {
            CustomField.upsert(customField);
          });
        }

        break;
      case ActionTypes.PROJECT_CREATE_HANDLE:
      case ActionTypes.BOARD_FETCH__SUCCESS:
      case ActionTypes.CARDS_FETCH__SUCCESS:
      case ActionTypes.CARD_CREATE_HANDLE:
      case ActionTypes.CARD_DUPLICATE__SUCCESS:
        payload.customFields.forEach((customField) => {
          CustomField.upsert(customField);
        });

        break;
      case ActionTypes.CUSTOM_FIELD_CREATE:
      case ActionTypes.CUSTOM_FIELD_CREATE_HANDLE:
      case ActionTypes.CUSTOM_FIELD_UPDATE__SUCCESS:
      case ActionTypes.CUSTOM_FIELD_UPDATE_HANDLE:
        CustomField.upsert(payload.customField);

        break;
      case ActionTypes.CUSTOM_FIELD_CREATE__SUCCESS:
        CustomField.withId(payload.localId).delete();
        CustomField.upsert(payload.customField);

        break;
      case ActionTypes.CUSTOM_FIELD_CREATE__FAILURE:
        CustomField.withId(payload.localId).delete();

        break;
      case ActionTypes.CUSTOM_FIELD_UPDATE:
        CustomField.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.CUSTOM_FIELD_DELETE:
        CustomField.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.CUSTOM_FIELD_DELETE__SUCCESS:
      case ActionTypes.CUSTOM_FIELD_DELETE_HANDLE: {
        const customFieldModel = CustomField.withId(payload.customField.id);

        if (customFieldModel) {
          customFieldModel.deleteWithRelated();
        }

        break;
      }
      default:
    }
  }

  duplicate(id, data) {
    return this.getClass().create({
      id,
      baseCustomFieldGroupId: this.baseCustomFieldGroupId,
      customFieldGroupId: this.customFieldGroupId,
      position: this.position,
      name: this.name,
      showOnFrontOfCard: this.showOnFrontOfCard,
      ...data,
    });
  }

  deleteRelated() {
    this.customFieldValues.delete();
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
