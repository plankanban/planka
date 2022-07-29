import { all, takeEvery } from 'redux-saga/effects';

import {
  fetchActionsInCurrentCardService,
  toggleActionsDetailsInCurrentCardService,
} from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* actionsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.ACTIONS_IN_CURRENT_CARD_FETCH, () =>
      fetchActionsInCurrentCardService(),
    ),
    takeEvery(
      EntryActionTypes.ACTIONS_DETAILS_IN_CURRENT_CARD_TOGGLE,
      ({ payload: { isVisible } }) => toggleActionsDetailsInCurrentCardService(isVisible),
    ),
  ]);
}
