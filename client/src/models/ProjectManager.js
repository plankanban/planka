/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'ProjectManager';

  static fields = {
    id: attr(),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'managers',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'projectManagers',
    }),
  };

  static reducer({ type, payload }, ProjectManager) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        ProjectManager.all().delete();

        payload.projectManagers.forEach((projectManager) => {
          ProjectManager.upsert(projectManager);
        });

        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_CREATE__SUCCESS:
      case ActionTypes.PROJECT_CREATE_HANDLE:
        payload.projectManagers.forEach((projectManager) => {
          ProjectManager.upsert(projectManager);
        });

        break;
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.projectManagers) {
          payload.projectManagers.forEach((projectManager) => {
            ProjectManager.upsert(projectManager);
          });
        }

        break;
      case ActionTypes.PROJECT_MANAGER_CREATE:
        ProjectManager.upsert(payload.projectManager);

        break;
      case ActionTypes.PROJECT_MANAGER_CREATE__SUCCESS:
        ProjectManager.withId(payload.localId).delete();
        ProjectManager.upsert(payload.projectManager);

        break;
      case ActionTypes.PROJECT_MANAGER_CREATE__FAILURE:
        ProjectManager.withId(payload.localId).delete();

        break;
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
        ProjectManager.upsert(payload.projectManager);

        if (payload.projectManagers) {
          payload.projectManagers.forEach((projectManager) => {
            ProjectManager.upsert(projectManager);
          });
        }

        break;
      case ActionTypes.PROJECT_MANAGER_DELETE:
        ProjectManager.withId(payload.id).delete();

        break;
      case ActionTypes.PROJECT_MANAGER_DELETE__SUCCESS:
      case ActionTypes.PROJECT_MANAGER_DELETE_HANDLE: {
        const projectManagerModel = ProjectManager.withId(payload.projectManager.id);

        if (projectManagerModel) {
          projectManagerModel.delete();
        }

        break;
      }
      default:
    }
  }
}
