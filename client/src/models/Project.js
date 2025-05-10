/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, many, oneToOne } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';
import { UserRoles } from '../constants/Enums';

export default class extends BaseModel {
  static modelName = 'Project';

  static fields = {
    id: attr(),
    name: attr(),
    description: attr(),
    backgroundType: attr(),
    backgroundGradient: attr(),
    isHidden: attr(),
    isFavorite: attr({
      getDefault: () => false,
    }),
    ownerProjectManagerId: oneToOne({
      to: 'ProjectManager',
      as: 'ownerProjectManager',
      relatedName: 'ownedProject',
    }),
    backgroundImageId: oneToOne({
      to: 'BackgroundImage',
      as: 'backgroundImage',
      relatedName: 'backgroundedProject', // TODO: rename?
    }),
    managerUsers: many({
      to: 'User',
      through: 'ProjectManager',
      relatedName: 'managerProjects',
    }),
  };

  static reducer({ type, payload }, Project) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
        if (payload.projects) {
          payload.projects.forEach((project) => {
            Project.upsert(project);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Project.all().delete();

        payload.projects.forEach((project) => {
          Project.upsert(project);
        });

        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.BOARD_FETCH__SUCCESS:
        payload.projects.forEach((project) => {
          Project.upsert(project);
        });

        break;
      case ActionTypes.USER_UPDATE_HANDLE:
        Project.all()
          .toModelArray()
          .forEach((projectModel) => {
            if (!payload.projectIds.includes(projectModel.id)) {
              projectModel.deleteWithRelated();
            }
          });

        if (payload.projects) {
          payload.projects.forEach((project) => {
            Project.upsert(project);
          });
        }

        break;
      case ActionTypes.PROJECT_CREATE__SUCCESS:
      case ActionTypes.PROJECT_CREATE_HANDLE:
      case ActionTypes.PROJECT_UPDATE__SUCCESS:
        Project.upsert(payload.project);

        break;
      case ActionTypes.PROJECT_UPDATE:
        Project.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.PROJECT_UPDATE_HANDLE: {
        const projectModel = Project.withId(payload.project.id);

        if (projectModel) {
          if (payload.isAvailable) {
            projectModel.boards.toModelArray().forEach((boardModel) => {
              if (!payload.boardIds.includes(boardModel.id)) {
                boardModel.deleteWithRelated();
              }
            });
          } else {
            projectModel.deleteWithRelated();
          }
        }

        Project.upsert(payload.project);

        break;
      }
      case ActionTypes.PROJECT_DELETE:
        Project.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.PROJECT_DELETE__SUCCESS:
      case ActionTypes.PROJECT_DELETE_HANDLE: {
        const projectModel = Project.withId(payload.project.id);

        if (projectModel) {
          projectModel.deleteWithRelated();
        }

        break;
      }
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE: {
        const projectModel = Project.withId(payload.projectManager.projectId);

        if (projectModel) {
          if (payload.isProjectAvailable) {
            projectModel.boards.toModelArray().forEach((boardModel) => {
              if (payload.boardIds.includes(boardModel.id)) {
                if (payload.isCurrentUser) {
                  boardModel.notificationServices.delete();
                }
              } else {
                boardModel.deleteWithRelated();
              }
            });
          } else {
            projectModel.deleteWithRelated();
          }
        }

        if (payload.project) {
          Project.upsert(payload.project);
        }

        break;
      }
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (!payload.isProjectAvailable) {
          const projectModel = Project.withId(payload.boardMembership.projectId);

          if (projectModel) {
            projectModel.deleteWithRelated();
          }
        }

        if (payload.project) {
          Project.upsert(payload.project);
        }

        break;
      default:
    }
  }

  static getSharedQuerySet() {
    return this.filter({
      ownerProjectManagerId: null,
    }).orderBy(['id.length', 'id']);
  }

  getManagersQuerySet() {
    return this.managers.orderBy(['id.length', 'id']);
  }

  getBackgroundImagesQuerySet() {
    return this.backgroundImages.orderBy(['id.length', 'id']);
  }

  getBaseCustomFieldGroupsQuerySet() {
    return this.baseCustomFieldGroups.orderBy(['id.length', 'id']);
  }

  getBoardsQuerySet() {
    return this.boards.orderBy(['position', 'id.length', 'id']);
  }

  getBoardsModelArrayForUserWithId(userId) {
    return this.getBoardsQuerySet()
      .toModelArray()
      .filter((boardModel) => boardModel.hasMembershipWithUserId(userId));
  }

  getBoardsModelArrayAvailableForUser(userModel) {
    if (this.isExternalAccessibleForUser(userModel)) {
      return this.getBoardsQuerySet().toModelArray();
    }

    return this.getBoardsModelArrayForUserWithId(userModel.id);
  }

  hasManagerWithUserId(userId) {
    return this.managers
      .filter({
        userId,
      })
      .exists();
  }

  hasMembershipWithUserIdInAnyBoard(userId) {
    return this.boards
      .toModelArray()
      .some((boardModel) => boardModel.hasMembershipWithUserId(userId));
  }

  isExternalAccessibleForUser(userModel) {
    if (!this.ownerProjectManagerId && userModel.role === UserRoles.ADMIN) {
      return true;
    }

    return this.hasManagerWithUserId(userModel.id);
  }

  isAvailableForUser(userModel) {
    return (
      this.isExternalAccessibleForUser(userModel) ||
      this.hasMembershipWithUserIdInAnyBoard(userModel.id)
    );
  }

  deleteRelated() {
    this.managers.delete();

    this.backgroundImages.toModelArray().forEach((backgroundImageModel) => {
      backgroundImageModel.deleteWithRelated();
    });

    this.baseCustomFieldGroups.toModelArray().forEach((baseCustomFieldGroupModel) => {
      baseCustomFieldGroupModel.deleteWithRelated();
    });

    this.boards.toModelArray().forEach((boardModel) => {
      boardModel.deleteWithRelated();
    });
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
