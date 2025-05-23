/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'BaseCustomFieldGroup';

  static fields = {
    id: attr(),
    name: attr(),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'baseCustomFieldGroups',
    }),
  };

  static reducer({ type, payload }, BaseCustomFieldGroup) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        BaseCustomFieldGroup.all().delete();

        payload.baseCustomFieldGroups.forEach((baseCustomFieldGroup) => {
          BaseCustomFieldGroup.upsert(baseCustomFieldGroup);
        });

        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_CREATE_HANDLE:
        payload.baseCustomFieldGroups.forEach((baseCustomFieldGroup) => {
          BaseCustomFieldGroup.upsert(baseCustomFieldGroup);
        });

        break;
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.baseCustomFieldGroups) {
          payload.baseCustomFieldGroups.forEach((baseCustomFieldGroup) => {
            BaseCustomFieldGroup.upsert(baseCustomFieldGroup);
          });
        }

        break;
      case ActionTypes.BASE_CUSTOM_FIELD_GROUP_CREATE:
      case ActionTypes.BASE_CUSTOM_FIELD_GROUP_CREATE_HANDLE:
      case ActionTypes.BASE_CUSTOM_FIELD_GROUP_UPDATE__SUCCESS:
      case ActionTypes.BASE_CUSTOM_FIELD_GROUP_UPDATE_HANDLE:
        BaseCustomFieldGroup.upsert(payload.baseCustomFieldGroup);

        break;
      case ActionTypes.BASE_CUSTOM_FIELD_GROUP_CREATE__SUCCESS:
        BaseCustomFieldGroup.withId(payload.localId).delete();
        BaseCustomFieldGroup.upsert(payload.baseCustomFieldGroup);

        break;
      case ActionTypes.BASE_CUSTOM_FIELD_GROUP_CREATE__FAILURE:
        BaseCustomFieldGroup.withId(payload.localId).delete();

        break;
      case ActionTypes.BASE_CUSTOM_FIELD_GROUP_UPDATE:
        BaseCustomFieldGroup.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.BASE_CUSTOM_FIELD_GROUP_DELETE:
        BaseCustomFieldGroup.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.BASE_CUSTOM_FIELD_GROUP_DELETE__SUCCESS:
      case ActionTypes.BASE_CUSTOM_FIELD_GROUP_DELETE_HANDLE: {
        const baseCustomFieldGroupModel = BaseCustomFieldGroup.withId(
          payload.baseCustomFieldGroup.id,
        );

        if (baseCustomFieldGroupModel) {
          baseCustomFieldGroupModel.deleteWithRelated();
        }

        break;
      }
      default:
    }
  }

  getCustomFieldsQuerySet() {
    return this.customFields.orderBy(['position', 'id.length', 'id']);
  }

  deleteRelated() {
    this.customFields.delete();

    this.customFieldGroups.toModelArray().forEach((customFieldGroupModel) => {
      customFieldGroupModel.deleteWithRelated();
    });
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
