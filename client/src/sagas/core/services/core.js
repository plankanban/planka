import { call, put } from 'redux-saga/effects';

import { fetchCoreRequest } from '../requests';
import { initializeCore } from '../../../actions';
import i18n from '../../../i18n';

// eslint-disable-next-line import/prefer-default-export
export function* initializeCoreService() {
  const {
    user,
    board,
    users,
    projects,
    projectManagers,
    boards,
    boardMemberships,
    labels,
    lists,
    cards,
    cardMemberships,
    cardLabels,
    tasks,
    attachments,
    actions,
    notifications,
  } = yield call(fetchCoreRequest); // TODO: handle error

  yield call(i18n.loadCoreLocale, i18n.language);

  yield put(
    initializeCore(
      user,
      board,
      users,
      projects,
      projectManagers,
      boards,
      boardMemberships,
      labels,
      lists,
      cards,
      cardMemberships,
      cardLabels,
      tasks,
      attachments,
      actions,
      notifications,
    ),
  );
}
