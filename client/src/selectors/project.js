import { createSelector } from 'redux-orm';

import orm from '../orm';
import { pathSelector } from './router';
import { currentUserIdSelector } from './user';
import { isLocalId } from '../utils/local-id';

export const currentProjectSelector = createSelector(
  orm,
  (state) => pathSelector(state).projectId,
  ({ Project }, id) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel.ref;
  },
);

export const managersForCurrentProjectSelector = createSelector(
  orm,
  (state) => pathSelector(state).projectId,
  (state) => currentUserIdSelector(state),
  ({ Project }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel
      .getOrderedManagersQuerySet()
      .toModelArray()
      .map((projectManagerModel) => ({
        ...projectManagerModel.ref,
        isPersisted: !isLocalId(projectManagerModel.id),
        user: {
          ...projectManagerModel.user.ref,
          isCurrent: projectManagerModel.user.id === currentUserId,
        },
      }));
  },
);

export const boardsForCurrentProjectSelector = createSelector(
  orm,
  (state) => pathSelector(state).projectId,
  (state) => currentUserIdSelector(state),
  ({ Project }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel.getOrderedAvailableBoardsModelArray(currentUserId).map((boardModel) => ({
      ...boardModel.ref,
      isPersisted: !isLocalId(boardModel.id),
    }));
  },
);

export const isCurrentUserManagerForCurrentProjectSelector = createSelector(
  orm,
  (state) => pathSelector(state).projectId,
  (state) => currentUserIdSelector(state),
  ({ Project }, id, currentUserId) => {
    if (!id) {
      return false;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return false;
    }

    return projectModel.hasManagerUser(currentUserId);
  },
);
