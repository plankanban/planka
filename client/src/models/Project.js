import { attr, many } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';
import { ProjectBackgroundTypes } from '../constants/Enums';

export default class extends BaseModel {
  static modelName = 'Project';

  static fields = {
    id: attr(),
    name: attr(),
    background: attr(),
    backgroundImage: attr(),
    isBackgroundImageUpdating: attr({
      getDefault: () => false,
    }),
    managerUsers: many({
      to: 'User',
      through: 'ProjectManager',
      relatedName: 'projects',
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
      case ActionTypes.PROJECT_CREATE__SUCCESS:
      case ActionTypes.PROJECT_CREATE_HANDLE:
      case ActionTypes.PROJECT_UPDATE__SUCCESS:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
        Project.upsert(payload.project);

        break;
      case ActionTypes.PROJECT_UPDATE: {
        const project = Project.withId(payload.id);
        project.update(payload.data);

        if (
          payload.data.backgroundImage === null &&
          project.background &&
          project.background.type === ProjectBackgroundTypes.IMAGE
        ) {
          project.background = null;
        }

        break;
      }
      case ActionTypes.PROJECT_BACKGROUND_IMAGE_UPDATE:
        Project.withId(payload.id).update({
          isBackgroundImageUpdating: true,
        });

        break;
      case ActionTypes.PROJECT_BACKGROUND_IMAGE_UPDATE__SUCCESS:
        Project.withId(payload.project.id).update({
          ...payload.project,
          isBackgroundImageUpdating: false,
        });

        break;
      case ActionTypes.PROJECT_BACKGROUND_IMAGE_UPDATE__FAILURE:
        Project.withId(payload.id).update({
          isBackgroundImageUpdating: false,
        });

        break;
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
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.project) {
          const projectModel = Project.withId(payload.project.id);

          if (projectModel) {
            projectModel.deleteWithRelated();
          }

          Project.upsert(payload.project);
        }

        break;
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE__PROJECT_FETCH:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE__PROJECT_FETCH: {
        const projectModel = Project.withId(payload.id);

        if (projectModel) {
          projectModel.boards.toModelArray().forEach((boardModel) => {
            if (boardModel.id !== payload.currentBoardId) {
              boardModel.update({
                isFetching: null,
              });

              boardModel.deleteRelated(payload.currentUserId);
            }
          });
        }

        break;
      }
      default:
    }
  }

  getOrderedManagersQuerySet() {
    return this.managers.orderBy('createdAt');
  }

  getOrderedBoardsQuerySet() {
    return this.boards.orderBy('position');
  }

  getOrderedBoardsModelArrayForUser(userId) {
    return this.getOrderedBoardsQuerySet()
      .toModelArray()
      .filter((boardModel) => boardModel.hasMembershipForUser(userId));
  }

  getOrderedBoardsModelArrayAvailableForUser(userId) {
    if (this.hasManagerForUser(userId)) {
      return this.getOrderedBoardsQuerySet().toModelArray();
    }

    return this.getOrderedBoardsModelArrayForUser(userId);
  }

  hasManagerForUser(userId) {
    return this.managers
      .filter({
        userId,
      })
      .exists();
  }

  hasMembershipInAnyBoardForUser(userId) {
    return this.boards.toModelArray().some((boardModel) => boardModel.hasMembershipForUser(userId));
  }

  isAvailableForUser(userId) {
    return this.hasManagerForUser(userId) || this.hasMembershipInAnyBoardForUser(userId);
  }

  deleteRelated() {
    this.managers.delete();

    this.boards.toModelArray().forEach((boardModel) => {
      boardModel.deleteWithRelated();
    });
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
