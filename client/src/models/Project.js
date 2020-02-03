import { Model, attr, many } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';

export default class extends Model {
  static modelName = 'Project';

  static fields = {
    id: attr(),
    name: attr(),
    users: many({
      to: 'User',
      through: 'ProjectMembership',
      relatedName: 'projects',
    }),
  };

  static reducer({ type, payload }, Project) {
    switch (type) {
      case ActionTypes.PROJECTS_FETCH_SUCCEEDED:
        payload.projects.forEach(project => {
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
    this.boards.toModelArray().forEach(boardModel => {
      boardModel.deleteWithRelated();
    });

    this.delete();
  }
}
