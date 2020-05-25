import { Model, attr, many } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';

export default class extends Model {
  static modelName = 'Project';

  static fields = {
    id: attr(),
    name: attr(),
    background: attr(),
    backgroundImage: attr(),
    isBackgroundImageUpdating: attr({
      getDefault: () => false,
    }),
    users: many({
      to: 'User',
      through: 'ProjectMembership',
      relatedName: 'projects',
    }),
  };

  static reducer({ type, payload }, Project) {
    switch (type) {
      case ActionTypes.PROJECTS_FETCH_SUCCEEDED:
        payload.projects.forEach((project) => {
          Project.upsert(project);
        });

        break;
      case ActionTypes.PROJECT_UPDATE:
        Project.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.PROJECT_DELETE:
        Project.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.PROJECT_CREATE_SUCCEEDED:
      case ActionTypes.PROJECT_CREATE_RECEIVED:
        Project.upsert(payload.project);

        break;
      case ActionTypes.PROJECT_UPDATE_RECEIVED:
        Project.withId(payload.project.id).update(payload.project);

        break;
      case ActionTypes.PROJECT_BACKGROUND_IMAGE_UPDATE_REQUESTED:
        Project.withId(payload.id).update({
          isBackgroundImageUpdating: true,
        });

        break;
      case ActionTypes.PROJECT_BACKGROUND_IMAGE_UPDATE_SUCCEEDED:
        Project.withId(payload.project.id).update({
          ...payload.project,
          isBackgroundImageUpdating: false,
        });

        break;
      case ActionTypes.PROJECT_BACKGROUND_IMAGE_UPDATE_FAILED:
        Project.withId(payload.id).update({
          isBackgroundImageUpdating: false,
        });

        break;
      case ActionTypes.PROJECT_DELETE_RECEIVED:
        Project.withId(payload.project.id).deleteWithRelated();

        break;
      default:
    }
  }

  getOrderedMembershipsQuerySet() {
    return this.memberships.orderBy('id');
  }

  getOrderedBoardsQuerySet() {
    return this.boards.orderBy('position');
  }

  deleteWithRelated() {
    this.boards.toModelArray().forEach((boardModel) => {
      boardModel.deleteWithRelated();
    });

    this.delete();
  }
}
