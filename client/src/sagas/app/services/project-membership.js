import { call, put, select } from 'redux-saga/effects';

import { createProjectMembershipRequest, deleteProjectMembershipRequest } from '../requests';
import { maxIdSelector, pathSelector } from '../../../selectors';
import { createProjectMembership, deleteProjectMembership } from '../../../actions';
import { nextLocalId } from '../../../utils/local-id';
import { ProjectMembership } from '../../../models';

export function* createProjectMembershipService(projectId, data) {
  const localId = nextLocalId(yield select(maxIdSelector, ProjectMembership.modelName));

  yield put(
    createProjectMembership({
      ...data,
      projectId,
      id: localId,
    }),
  );

  yield call(createProjectMembershipRequest, projectId, localId, data);
}

export function* createMembershipInCurrentProjectService(data) {
  const { projectId } = yield select(pathSelector);

  yield call(createProjectMembershipService, projectId, data);
}

export function* deleteProjectMembershipService(id) {
  yield put(deleteProjectMembership(id));
  yield call(deleteProjectMembershipRequest, id);
}
