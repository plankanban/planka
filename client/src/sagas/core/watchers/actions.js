import { takeEvery } from 'redux-saga/effects';

import { fetchActionsInCurrentCardService } from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* actionsWatchers() {
  yield takeEvery(EntryActionTypes.ACTIONS_IN_CURRENT_CARD_FETCH, () =>
    fetchActionsInCurrentCardService(),
  );
}
