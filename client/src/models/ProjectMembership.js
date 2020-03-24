import { Model, attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';

export default class extends Model {
  static modelName = 'ProjectMembership';

  static fields = {
    id: attr(),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'memberships',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'projectMemberships',
    }),
  };

  static reducer({ type, payload }, ProjectMembership) {
    switch (type) {
      case ActionTypes.PROJECTS_FETCH_SUCCEEDED:
      case ActionTypes.PROJECT_CREATE_SUCCEEDED:
      case ActionTypes.PROJECT_CREATE_RECEIVED:
        payload.projectMemberships.forEach((projectMembership) => {
          ProjectMembership.upsert(projectMembership);
        });

        break;
      case ActionTypes.PROJECT_MEMBERSHIP_CREATE:
      case ActionTypes.PROJECT_MEMBERSHIP_CREATE_RECEIVED:
        ProjectMembership.upsert(payload.projectMembership);

        break;
      case ActionTypes.PROJECT_MEMBERSHIP_CREATE_SUCCEEDED:
        ProjectMembership.withId(payload.localId).delete();
        ProjectMembership.upsert(payload.projectMembership);

        break;
      case ActionTypes.PROJECT_MEMBERSHIP_DELETE:
        ProjectMembership.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.PROJECT_MEMBERSHIP_DELETE_RECEIVED:
        ProjectMembership.withId(payload.projectMembership.id).deleteWithRelated();

        break;
      default:
    }
  }

  deleteWithRelated() {
    this.project.boards.toModelArray().forEach((boardModel) => {
      boardModel.cards.toModelArray().forEach((cardModel) => {
        try {
          cardModel.users.remove(this.userId);
        } catch {} // eslint-disable-line no-empty
      });

      try {
        boardModel.filterUsers.remove(this.userId);
      } catch {} // eslint-disable-line no-empty
    });

    this.delete();
  }
}
