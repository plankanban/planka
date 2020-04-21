import { Model, attr } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';

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

export default class extends Model {
  static modelName = 'User';

  static fields = {
    id: attr(),
    email: attr(),
    name: attr(),
    avatarUrl: attr(),
    phone: attr(),
    organization: attr(),
    subscribeToOwnCards: attr(),
    deletedAt: attr(),
    isAdmin: attr({
      getDefault: () => false,
    }),
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
      case ActionTypes.USER_EMAIL_UPDATE_ERROR_CLEAR: {
        const userModel = User.withId(payload.id);

        userModel.update({
          emailUpdateForm: {
            ...userModel.emailUpdateForm,
            error: null,
          },
        });

        break;
      }
      case ActionTypes.USER_PASSWORD_UPDATE_ERROR_CLEAR: {
        const userModel = User.withId(payload.id);

        userModel.update({
          passwordUpdateForm: {
            ...userModel.passwordUpdateForm,
            error: null,
          },
        });

        break;
      }
      case ActionTypes.USER_USERNAME_UPDATE_ERROR_CLEAR: {
        const userModel = User.withId(payload.id);

        userModel.update({
          usernameUpdateForm: {
            ...userModel.usernameUpdateForm,
            error: null,
          },
        });

        break;
      }
      case ActionTypes.USER_DELETE:
        User.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.USER_UPDATE_RECEIVED:
        User.withId(payload.user.id).update(payload.user);

        break;
      case ActionTypes.USER_EMAIL_UPDATE_REQUESTED: {
        const userModel = User.withId(payload.id);

        userModel.update({
          emailUpdateForm: {
            ...userModel.emailUpdateForm,
            data: payload.data,
            isSubmitting: true,
          },
        });

        break;
      }
      case ActionTypes.USER_EMAIL_UPDATE_SUCCEEDED: {
        User.withId(payload.id).update({
          email: payload.email,
          emailUpdateForm: DEFAULT_EMAIL_UPDATE_FORM,
        });

        break;
      }
      case ActionTypes.USER_EMAIL_UPDATE_FAILED: {
        const userModel = User.withId(payload.id);

        userModel.update({
          emailUpdateForm: {
            ...userModel.emailUpdateForm,
            isSubmitting: false,
            error: payload.error,
          },
        });

        break;
      }
      case ActionTypes.USER_PASSWORD_UPDATE_REQUESTED: {
        const userModel = User.withId(payload.id);

        userModel.update({
          passwordUpdateForm: {
            ...userModel.passwordUpdateForm,
            data: payload.data,
            isSubmitting: true,
          },
        });

        break;
      }
      case ActionTypes.USER_PASSWORD_UPDATE_SUCCEEDED: {
        User.withId(payload.id).update({
          passwordUpdateForm: DEFAULT_PASSWORD_UPDATE_FORM,
        });

        break;
      }
      case ActionTypes.USER_PASSWORD_UPDATE_FAILED: {
        const userModel = User.withId(payload.id);

        userModel.update({
          passwordUpdateForm: {
            ...userModel.passwordUpdateForm,
            isSubmitting: false,
            error: payload.error,
          },
        });

        break;
      }
      case ActionTypes.USER_USERNAME_UPDATE_REQUESTED: {
        const userModel = User.withId(payload.id);

        userModel.update({
          usernameUpdateForm: {
            ...userModel.usernameUpdateForm,
            data: payload.data,
            isSubmitting: true,
          },
        });

        break;
      }
      case ActionTypes.USER_USERNAME_UPDATE_SUCCEEDED: {
        User.withId(payload.id).update({
          username: payload.username,
          usernameUpdateForm: DEFAULT_USERNAME_UPDATE_FORM,
        });

        break;
      }
      case ActionTypes.USER_USERNAME_UPDATE_FAILED: {
        const userModel = User.withId(payload.id);

        userModel.update({
          usernameUpdateForm: {
            ...userModel.usernameUpdateForm,
            isSubmitting: false,
            error: payload.error,
          },
        });

        break;
      }
      case ActionTypes.USER_AVATAR_UPDATE_REQUESTED:
        User.withId(payload.id).update({
          isAvatarUpdating: true,
        });

        break;
      case ActionTypes.USER_AVATAR_UPDATE_SUCCEEDED:
        User.withId(payload.id).update({
          avatarUrl: payload.avatarUrl,
          isAvatarUpdating: false,
        });

        break;
      case ActionTypes.USER_AVATAR_UPDATE_FAILED:
        User.withId(payload.id).update({
          isAvatarUpdating: false,
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
      .orderBy('id', false);
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
