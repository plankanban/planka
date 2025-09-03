/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export const buildCustomFieldValueId = (customFieldValue) =>
  JSON.stringify({
    cardId: customFieldValue.cardId,
    customFieldGroupId: customFieldValue.customFieldGroupId,
    customFieldId: customFieldValue.customFieldId,
  });

const prepareCustomFieldValue = (customFieldValue) => ({
  ...customFieldValue,
  id: buildCustomFieldValueId(customFieldValue),
});

export default class extends BaseModel {
  static modelName = 'CustomFieldValue';

  static fields = {
    id: attr(),
    content: attr(),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'customFieldValues',
    }),
    customFieldGroupId: fk({
      to: 'CustomFieldGroup',
      as: 'customFieldGroup',
      relatedName: 'customFieldValues',
    }),
    customFieldId: fk({
      to: 'CustomField',
      as: 'customField',
      relatedName: 'customFieldValues',
    }),
  };

  static reducer({ type, payload }, CustomFieldValue) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
      case ActionTypes.LIST_UPDATE_HANDLE:
      case ActionTypes.CARD_UPDATE_HANDLE:
        if (payload.customFieldValues) {
          payload.customFieldValues.forEach((customFieldValue) => {
            CustomFieldValue.upsert(prepareCustomFieldValue(customFieldValue));
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        CustomFieldValue.all().delete();

        if (payload.customFieldValues) {
          payload.customFieldValues.forEach((customFieldValue) => {
            CustomFieldValue.upsert(prepareCustomFieldValue(customFieldValue));
          });
        }

        break;
      case ActionTypes.BOARD_FETCH__SUCCESS:
      case ActionTypes.CARDS_FETCH__SUCCESS:
      case ActionTypes.CARD_CREATE_HANDLE:
      case ActionTypes.CARD_DUPLICATE__SUCCESS:
        payload.customFieldValues.forEach((customFieldValue) => {
          CustomFieldValue.upsert(prepareCustomFieldValue(customFieldValue));
        });

        break;
      case ActionTypes.CUSTOM_FIELD_VALUE_UPDATE:
      case ActionTypes.CUSTOM_FIELD_VALUE_UPDATE__SUCCESS:
      case ActionTypes.CUSTOM_FIELD_VALUE_UPDATE_HANDLE:
        CustomFieldValue.upsert(prepareCustomFieldValue(payload.customFieldValue));

        break;
      case ActionTypes.CUSTOM_FIELD_VALUE_DELETE: {
        const customFieldValueModel = CustomFieldValue.withId(payload.id);

        if (customFieldValueModel) {
          customFieldValueModel.delete();
        }

        break;
      }
      case ActionTypes.CUSTOM_FIELD_VALUE_DELETE__SUCCESS:
      case ActionTypes.CUSTOM_FIELD_VALUE_DELETE_HANDLE: {
        const customFieldValueModel = CustomFieldValue.withId(
          buildCustomFieldValueId(payload.customFieldValue),
        );

        if (customFieldValueModel) {
          customFieldValueModel.delete();
        }

        break;
      }
      default:
    }
  }

  duplicate(data) {
    const customFieldValue = {
      cardId: this.cardId,
      customFieldGroupId: this.customFieldGroupId,
      customFieldId: this.customFieldId,
      content: this.content,
      ...data,
    };

    return this.getClass().create({
      id: buildCustomFieldValueId(customFieldValue),
      ...customFieldValue,
    });
  }
}
