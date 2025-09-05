/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import orderBy from 'lodash/orderBy';
import { attr } from 'redux-orm';

import BaseModel from './BaseModel';
import buildSearchParts from '../utils/build-search-parts';
import ActionTypes from '../constants/ActionTypes';
import { UserRoles } from '../constants/Enums';

const DEFAULT_EMAIL_UPDATE_FORM = {
  data: {
    email: '',
    currentPassword: '',
  },
  isSubmitting: false,
  error: null,
};

const DEFAULT_PASSWORD_UPDATE_FORM = {
  data: {
    password: '',
    currentPassword: '',
  },
  isSubmitting: false,
  error: null,
};

const DEFAULT_USERNAME_UPDATE_FORM = {
  data: {
    username: '',
    currentPassword: '',
  },
  isSubmitting: false,
  error: null,
};

const filterProjectModels = (projectModels, search, isHidden) => {
  let filteredProjectModels = projectModels.filter(
    (projectModel) => projectModel.isHidden === isHidden,
  );

  if (filteredProjectModels.length > 0 && search) {
    const searchParts = buildSearchParts(search);

    filteredProjectModels = filteredProjectModels.filter((projectModel) =>
      searchParts.every((searchPart) => projectModel.name.toLowerCase().includes(searchPart)),
    );
  }

  return filteredProjectModels;
};

export default class extends BaseModel {
  static modelName = 'User';

  static fields = {
    id: attr(),
    email: attr(),
    role: attr(),
    username: attr(),
    name: attr(),
    avatar: attr(),
    phone: attr(),
    organization: attr(),
    language: attr(),
    subscribeToOwnCards: attr(),
    subscribeToCardWhenCommenting: attr(),
    turnOffRecentCardHighlighting: attr(),
    isDefaultAdmin: attr(),
    isSsoUser: attr(),
    isDeactivated: attr(),
    lockedFieldNames: attr(),
    isAvatarUpdating: attr({
      getDefault: () => false,
    }),
    emailUpdateForm: attr({
      getDefault: () => DEFAULT_EMAIL_UPDATE_FORM,
    }),
    passwordUpdateForm: attr({
      getDefault: () => DEFAULT_PASSWORD_UPDATE_FORM,
    }),
    usernameUpdateForm: attr({
      getDefault: () => DEFAULT_USERNAME_UPDATE_FORM,
    }),
  };

  static reducer({ type, payload }, User) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
      case ActionTypes.LIST_UPDATE_HANDLE:
      case ActionTypes.CARD_UPDATE_HANDLE:
        if (payload.users) {
          payload.users.forEach((user) => {
            User.upsert(user);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        User.all().delete();
        User.upsert(payload.user);

        payload.users.forEach((user) => {
          User.upsert(user);
        });

        break;
      case ActionTypes.CORE_INITIALIZE:
        User.upsert(payload.user);

        payload.users.forEach((user) => {
          User.upsert(user);
        });

        break;
      case ActionTypes.USER_CREATE__SUCCESS:
      case ActionTypes.USER_CREATE_HANDLE:
      case ActionTypes.USER_UPDATE__SUCCESS:
        User.upsert(payload.user);

        break;
      case ActionTypes.USER_UPDATE:
        User.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.USER_UPDATE_HANDLE:
        User.upsert(payload.user);

        if (payload.users) {
          payload.users.forEach((user) => {
            User.upsert(user);
          });
        }

        break;
      case ActionTypes.USER_EMAIL_UPDATE: {
        const userModel = User.withId(payload.id);

        userModel.emailUpdateForm = {
          ...userModel.emailUpdateForm,
          data: payload.data,
          isSubmitting: true,
        };

        break;
      }
      case ActionTypes.USER_EMAIL_UPDATE__SUCCESS:
        User.withId(payload.user.id).update({
          ...payload.user,
          emailUpdateForm: DEFAULT_EMAIL_UPDATE_FORM,
        });

        break;
      case ActionTypes.USER_EMAIL_UPDATE__FAILURE: {
        const userModel = User.withId(payload.id);

        userModel.emailUpdateForm = {
          ...userModel.emailUpdateForm,
          isSubmitting: false,
          error: payload.error,
        };

        break;
      }
      case ActionTypes.USER_EMAIL_UPDATE_ERROR_CLEAR: {
        const userModel = User.withId(payload.id);

        userModel.emailUpdateForm = {
          ...userModel.emailUpdateForm,
          error: null,
        };

        break;
      }
      case ActionTypes.USER_PASSWORD_UPDATE: {
        const userModel = User.withId(payload.id);

        userModel.passwordUpdateForm = {
          ...userModel.passwordUpdateForm,
          data: payload.data,
          isSubmitting: true,
        };

        break;
      }
      case ActionTypes.USER_PASSWORD_UPDATE__SUCCESS:
        User.withId(payload.user.id).update({
          ...payload.user,
          passwordUpdateForm: DEFAULT_PASSWORD_UPDATE_FORM,
        });

        break;
      case ActionTypes.USER_PASSWORD_UPDATE__FAILURE: {
        const userModel = User.withId(payload.id);

        userModel.passwordUpdateForm = {
          ...userModel.passwordUpdateForm,
          isSubmitting: false,
          error: payload.error,
        };

        break;
      }
      case ActionTypes.USER_PASSWORD_UPDATE_ERROR_CLEAR: {
        const userModel = User.withId(payload.id);

        userModel.passwordUpdateForm = {
          ...userModel.passwordUpdateForm,
          error: null,
        };

        break;
      }
      case ActionTypes.USER_USERNAME_UPDATE: {
        const userModel = User.withId(payload.id);

        userModel.usernameUpdateForm = {
          ...userModel.usernameUpdateForm,
          data: payload.data,
          isSubmitting: true,
        };

        break;
      }
      case ActionTypes.USER_USERNAME_UPDATE__SUCCESS:
        User.withId(payload.user.id).update({
          ...payload.user,
          usernameUpdateForm: DEFAULT_USERNAME_UPDATE_FORM,
        });

        break;
      case ActionTypes.USER_USERNAME_UPDATE__FAILURE: {
        const userModel = User.withId(payload.id);

        userModel.usernameUpdateForm = {
          ...userModel.usernameUpdateForm,
          isSubmitting: false,
          error: payload.error,
        };

        break;
      }
      case ActionTypes.USER_USERNAME_UPDATE_ERROR_CLEAR: {
        const userModel = User.withId(payload.id);

        userModel.usernameUpdateForm = {
          ...userModel.usernameUpdateForm,
          error: null,
        };

        break;
      }
      case ActionTypes.USER_AVATAR_UPDATE:
        User.withId(payload.id).update({
          isAvatarUpdating: true,
        });

        break;
      case ActionTypes.USER_AVATAR_UPDATE__SUCCESS:
        User.withId(payload.user.id).update({
          ...payload.user,
          isAvatarUpdating: false,
        });

        break;
      case ActionTypes.USER_AVATAR_UPDATE__FAILURE:
        User.withId(payload.id).update({
          isAvatarUpdating: false,
        });

        break;
      case ActionTypes.USER_DELETE:
        User.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.USER_DELETE__SUCCESS:
      case ActionTypes.USER_DELETE_HANDLE: {
        const userModel = User.withId(payload.user.id);

        if (userModel) {
          userModel.deleteWithRelated();
        }

        break;
      }
      case ActionTypes.PROJECT_CREATE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_FETCH__SUCCESS:
      case ActionTypes.CARDS_FETCH__SUCCESS:
      case ActionTypes.CARD_CREATE_HANDLE:
      case ActionTypes.COMMENTS_FETCH__SUCCESS:
      case ActionTypes.COMMENT_CREATE_HANDLE:
      case ActionTypes.ACTIVITIES_IN_BOARD_FETCH__SUCCESS:
      case ActionTypes.ACTIVITIES_IN_CARD_FETCH__SUCCESS:
      case ActionTypes.NOTIFICATION_CREATE_HANDLE:
        payload.users.forEach((user) => {
          User.upsert(user);
        });

        break;
      default:
    }
  }

  static getAllQuerySet() {
    return this.orderBy([({ name }) => name.toLowerCase(), 'id.length', 'id']);
  }

  static getActiveQuerySet() {
    return this.filter({
      isDeactivated: false,
    }).orderBy([({ name }) => name.toLowerCase(), 'id.length', 'id']);
  }

  getProjectManagersQuerySet() {
    return this.projectManagers.orderBy(['id.length', 'id']);
  }

  getBoardMembershipsQuerySet() {
    return this.boardMemberships.orderBy(['id.length', 'id']);
  }

  getUnreadNotificationsQuerySet() {
    return this.notifications
      .filter({
        isRead: false,
      })
      .orderBy(['id.length', 'id'], ['desc', 'desc']);
  }

  getNotificationServicesQuerySet() {
    return this.notificationServices.orderBy(['id.length', 'id']);
  }

  getManagerProjectsModelArray() {
    return this.getProjectManagersQuerySet()
      .toModelArray()
      .map(({ project: projectModel }) => projectModel);
  }

  getMembershipProjectsModelArray() {
    const projectIds = [];

    return this.getBoardMembershipsQuerySet()
      .toModelArray()
      .flatMap(({ board: { project: projectModel } }) => {
        if (projectIds.includes(projectModel.id)) {
          return [];
        }

        projectIds.push(projectModel.id);
        return projectModel;
      });
  }

  getSeparatedProjectsModelArray() {
    const projectIds = [];

    const managerProjectModels = this.getManagerProjectsModelArray().map((projectModel) => {
      projectIds.push(projectModel.id);
      return projectModel;
    });

    const membershipProjectModels = this.getMembershipProjectsModelArray().flatMap(
      (projectModel) => {
        if (projectIds.includes(projectModel.id)) {
          return [];
        }

        projectIds.push(projectModel.id);
        return projectModel;
      },
    );

    let adminProjectModels = [];
    if (this.role === UserRoles.ADMIN) {
      const {
        session: { Project },
      } = this.getClass();

      adminProjectModels = Project.getSharedQuerySet()
        .toModelArray()
        .flatMap((projectModel) => {
          if (projectIds.includes(projectModel.id)) {
            return [];
          }

          projectIds.push(projectModel.id);
          return projectModel;
        });
    }

    return {
      managerProjectModels,
      membershipProjectModels,
      adminProjectModels,
    };
  }

  getProjectsModelArray() {
    const { managerProjectModels, membershipProjectModels, adminProjectModels } =
      this.getSeparatedProjectsModelArray();

    return [...managerProjectModels, ...membershipProjectModels, ...adminProjectModels];
  }

  getFavoriteProjectsModelArray(orderByArgs) {
    let projectModels = this.getProjectsModelArray();

    projectModels = projectModels.filter(
      (projectModel) => !projectModel.isHidden && projectModel.isFavorite,
    );

    if (orderByArgs) {
      projectModels = orderBy(projectModels, ...orderByArgs);
    }

    return projectModels;
  }

  getFilteredSeparatedProjectsModelArray(search, isHidden, orderByArgs) {
    const separatedProjectModels = this.getSeparatedProjectsModelArray();

    return Object.entries(separatedProjectModels).reduce((result, [key, projectModels]) => {
      let filteredProjectModels = filterProjectModels(projectModels, search, isHidden);

      if (orderByArgs) {
        filteredProjectModels = orderBy(filteredProjectModels, ...orderByArgs);
      }

      return {
        ...result,
        [key]: filteredProjectModels,
      };
    }, {});
  }

  getFilteredProjectsModelArray(search, isHidden, orderByArgs) {
    let projectModels = this.getProjectsModelArray();
    projectModels = filterProjectModels(projectModels, search, isHidden);

    if (orderByArgs) {
      projectModels = orderBy(projectModels, ...orderByArgs);
    }

    return projectModels;
  }

  deleteRelated() {
    this.projectManagers.toModelArray().forEach((projectManagerModel) => {
      if (projectManagerModel.ownedProject) {
        projectManagerModel.ownedProject.deleteWithRelated();
      } else {
        projectManagerModel.delete();
      }
    });

    this.boardMemberships.toModelArray().forEach((boardMembershipModel) => {
      boardMembershipModel.deleteWithRelated();
    });

    this.createdCards.toModelArray().forEach((cardModel) => {
      cardModel.update({
        creatorUserId: null,
      });
    });

    this.assignedTasks.toModelArray().forEach((taskModel) => {
      taskModel.update({
        assigneeUserId: null,
      });
    });

    this.createdAttachments.toModelArray().forEach((attachmentModel) => {
      attachmentModel.update({
        creatorUserId: null,
      });
    });

    this.comments.toModelArray().forEach((commentModel) => {
      commentModel.update({
        userId: null,
      });
    });

    this.activities.toModelArray().forEach((activityModel) => {
      activityModel.update({
        userId: null,
      });
    });

    this.createdNotifications.toModelArray().forEach((notificationModel) => {
      notificationModel.update({
        creatorUserId: null,
      });
    });

    this.notificationServices.delete();
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
