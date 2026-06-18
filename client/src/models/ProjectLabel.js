/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'ProjectLabel';

  static fields = {
    id: attr(),
    position: attr(),
    name: attr(),
    color: attr(),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'labels',
    }),
  };

  static reducer({ type, payload }, ProjectLabel) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.projectLabels) {
          payload.projectLabels.forEach((projectLabel) => {
            ProjectLabel.upsert(projectLabel);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        ProjectLabel.all().delete();

        if (payload.projectLabels) {
          payload.projectLabels.forEach((projectLabel) => {
            ProjectLabel.upsert(projectLabel);
          });
        }

        break;
      case ActionTypes.BOARD_FETCH__SUCCESS:
        if (payload.projectLabels) {
          payload.projectLabels.forEach((projectLabel) => {
            ProjectLabel.upsert(projectLabel);
          });
        }

        break;
      case ActionTypes.PROJECT_LABEL_CREATE:
      case ActionTypes.PROJECT_LABEL_CREATE_HANDLE:
      case ActionTypes.PROJECT_LABEL_UPDATE__SUCCESS:
      case ActionTypes.PROJECT_LABEL_UPDATE_HANDLE:
        ProjectLabel.upsert(payload.projectLabel);

        break;
      case ActionTypes.PROJECT_LABEL_CREATE__SUCCESS:
        ProjectLabel.withId(payload.localId).delete();
        ProjectLabel.upsert(payload.projectLabel);

        break;
      case ActionTypes.PROJECT_LABEL_CREATE__FAILURE:
        ProjectLabel.withId(payload.localId).delete();

        break;
      case ActionTypes.PROJECT_LABEL_UPDATE:
        ProjectLabel.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.PROJECT_LABEL_DELETE:
        ProjectLabel.withId(payload.id).delete();

        break;
      case ActionTypes.PROJECT_LABEL_DELETE__SUCCESS:
      case ActionTypes.PROJECT_LABEL_DELETE_HANDLE: {
        const projectLabelModel = ProjectLabel.withId(payload.projectLabel.id);

        if (projectLabelModel) {
          projectLabelModel.delete();
        }

        break;
      }
      default:
    }
  }
}
