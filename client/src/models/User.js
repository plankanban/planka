import { Model, attr } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';

export default class extends Model {
  static modelName = 'User';

  static fields = {
    id: attr(),
    email: attr(),
    name: attr(),
    avatar: attr(),
    deletedAt: attr(),
    isAdmin: attr({
      getDefault: () => false,
    }),
    isAvatarUploading: attr({
      getDefault: () => false,
    }),
  };

  static reducer({ type, payload }, User) {
    switch (type) {
      case ActionTypes.USER_CREATE_SUCCEEDED:
      case ActionTypes.USER_CREATE_RECEIVED:
      case ActionTypes.CURRENT_USER_FETCH_SUCCEEDED:
      case ActionTypes.PROJECT_MEMBERSHIP_CREATE_RECEIVED:
      case ActionTypes.NOTIFICATION_CREATE_RECEIVED:
        User.upsert(payload.user);

        break;
      case ActionTypes.USERS_FETCH_SUCCEEDED:
      case ActionTypes.PROJECTS_FETCH_SUCCEEDED:
      case ActionTypes.PROJECT_CREATE_SUCCEEDED:
      case ActionTypes.PROJECT_CREATE_RECEIVED:
      case ActionTypes.ACTIONS_FETCH_SUCCEEDED:
      case ActionTypes.NOTIFICATIONS_FETCH_SUCCEEDED:
        payload.users.forEach((user) => {
          User.upsert(user);
        });

        break;
      case ActionTypes.USER_UPDATE:
        User.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.USER_DELETE:
        User.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.USER_UPDATE_RECEIVED:
        User.withId(payload.user.id).update(payload.user);

        break;
      case ActionTypes.USER_AVATAR_UPLOAD_REQUESTED:
        User.withId(payload.id).update({
          isAvatarUploading: true,
        });

        break;
      case ActionTypes.USER_AVATAR_UPLOAD_SUCCEEDED:
        User.withId(payload.user.id).update({
          ...payload.user,
          isAvatarUploading: false,
        });

        break;
      case ActionTypes.USER_AVATAR_UPLOAD_FAILED:
        User.withId(payload.id).update({
          isAvatarUploading: false,
        });

        break;
      case ActionTypes.USER_DELETE_SUCCEEDED:
      case ActionTypes.USER_DELETE_RECEIVED:
        User.withId(payload.user.id).deleteWithRelated(payload.user);

        break;
      default:
    }
  }

  static getOrderedUndeletedQuerySet() {
    return this.filter({
      deletedAt: null,
    }).orderBy('id');
  }

  getOrderedProjectMembershipsQuerySet() {
    return this.projectMemberships.orderBy('id');
  }

  getOrderedUnreadNotificationsQuerySet() {
    return this.notifications
      .filter({
        isRead: false,
      })
      .orderBy('id', 'desc');
  }

  deleteWithRelated(user) {
    this.projectMemberships.toModelArray().forEach((projectMembershipModel) => {
      projectMembershipModel.deleteWithRelated();
    });

    this.update(
      user || {
        deletedAt: new Date(),
      },
    );
  }
}
