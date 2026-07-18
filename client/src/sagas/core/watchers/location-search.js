/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, debounce, takeEvery } from "redux-saga/effects";

import services from "../services";
import EntryActionTypes from "../../../constants/EntryActionTypes";

export default function* locationSearchWatchers() {
  yield all([
    debounce(
      300,
      EntryActionTypes.LOCATION_SEARCH,
      ({ payload: { cardId, query } }) =>
        services.searchLocations(cardId, query),
    ),
    takeEvery(EntryActionTypes.LOCATION_SEARCH_CLEAR, () =>
      services.clearLocationSearchResults(),
    ),
  ]);
}
