import { takeLatest } from 'redux-saga/effects';

import { fetchActionsInCurrentCardService } from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* () {
  // eslint-disable-next-line max-len
  yield takeLatest(EntryActionTypes.ACTIONS_IN_CURRENT_CARD_FETCH, () => fetchActionsInCurrentCardService());
}
