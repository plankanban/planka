/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* projectLabelsWatchers() {
  yield all([
    takeEvery(
      EntryActionTypes.PROJECT_LABEL_IN_CURRENT_PROJECT_CREATE,
      ({ payload: { data } }) => services.createProjectLabelInCurrentProject(data),
    ),
    takeEvery(EntryActionTypes.PROJECT_LABEL_CREATE_HANDLE, ({ payload: { projectLabel } }) =>
      services.handleProjectLabelCreate(projectLabel),
    ),
    takeEvery(EntryActionTypes.PROJECT_LABEL_UPDATE, ({ payload: { id, data } }) =>
      services.updateProjectLabel(id, data),
    ),
    takeEvery(EntryActionTypes.PROJECT_LABEL_UPDATE_HANDLE, ({ payload: { projectLabel } }) =>
      services.handleProjectLabelUpdate(projectLabel),
    ),
    takeEvery(EntryActionTypes.PROJECT_LABEL_MOVE, ({ payload: { id, index } }) =>
      services.moveProjectLabel(id, index),
    ),
    takeEvery(EntryActionTypes.PROJECT_LABEL_DELETE, ({ payload: { id } }) =>
      services.deleteProjectLabel(id),
    ),
    takeEvery(EntryActionTypes.PROJECT_LABEL_DELETE_HANDLE, ({ payload: { projectLabel } }) =>
      services.handleProjectLabelDelete(projectLabel),
    ),
  ]);
}
