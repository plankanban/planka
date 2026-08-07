/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { buffers, eventChannel } from 'redux-saga';
import { call, cancelled, delay, put, race, select, take } from 'redux-saga/effects';

import { logout as logoutService } from './core';
import selectors from '../../../selectors';
import actions from '../../../actions';
import {
  postActivity as broadcastActivity,
  postLogout as broadcastLogout,
  postStayLoggedIn as broadcastStayLoggedIn,
  subscribe as subscribeToChannel,
} from '../../../utils/auto-logout-channel';
import { AutoLogoutModes } from '../../../constants/Enums';
import ActionTypes from '../../../constants/ActionTypes';
import EntryActionTypes from '../../../constants/EntryActionTypes';

const WARNING_LEAD_MS = 30 * 1000;
const ACTIVITY_THROTTLE_MS = 1000;
const BROADCAST_THROTTLE_MS = 2000;

const MODE_DURATIONS_MS = {
  [AutoLogoutModes.MINUTES_2]: 2 * 60 * 1000,
  [AutoLogoutModes.MINUTES_5]: 5 * 60 * 1000,
  [AutoLogoutModes.MINUTES_10]: 10 * 60 * 1000,
  [AutoLogoutModes.MINUTES_30]: 30 * 60 * 1000,
  [AutoLogoutModes.HOURS_12]: 12 * 60 * 60 * 1000,
};

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'wheel', 'touchstart', 'mousemove'];

const EventTypes = {
  LOCAL_ACTIVITY: 'localActivity',
  REMOTE_ACTIVITY: 'remoteActivity',
  REMOTE_LOGOUT: 'remoteLogout',
  REMOTE_STAY_LOGGED_IN: 'remoteStayLoggedIn',
};

const MODE_CHANGE_TRIGGER_TYPES = [
  ActionTypes.CORE_INITIALIZE,
  ActionTypes.USER_UPDATE__SUCCESS,
  ActionTypes.USER_UPDATE_HANDLE,
];

const selectCurrentUserAutoLogoutMode = (state) => {
  const user = selectors.selectCurrentUser(state);
  return user ? user.autoLogoutMode : null;
};

const createEventChannel = () =>
  eventChannel((emit) => {
    let lastActivityEmit = 0;

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityEmit < ACTIVITY_THROTTLE_MS) {
        return;
      }
      lastActivityEmit = now;
      emit({ type: EventTypes.LOCAL_ACTIVITY });
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    const unsubscribe = subscribeToChannel((message) => {
      if (!message || !message.type) {
        return;
      }
      if (message.type === 'activity') {
        emit({ type: EventTypes.REMOTE_ACTIVITY });
      } else if (message.type === 'logout') {
        emit({ type: EventTypes.REMOTE_LOGOUT });
      } else if (message.type === 'stay-logged-in') {
        emit({ type: EventTypes.REMOTE_STAY_LOGGED_IN });
      }
    });

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      unsubscribe();
    };
  }, buffers.sliding(8));

let lastBroadcastAt = 0;

function* maybeBroadcastActivity() {
  const now = Date.now();
  if (now - lastBroadcastAt < BROADCAST_THROTTLE_MS) {
    return;
  }
  lastBroadcastAt = now;
  yield call(broadcastActivity);
}

function* triggerLogout({ broadcast = true } = {}) {
  if (broadcast) {
    yield call(broadcastLogout);
  }
  yield put(actions.dismissAutoLogoutWarning());
  yield call(logoutService, true);
}

function* waitForRelevantEvent(channel, predicate) {
  while (true) {
    const event = yield take(channel);
    if (predicate(event)) {
      return event;
    }
  }
}

function* runIdleMode(channel) {
  // For NEVER mode: only react to remote logout broadcasts so a logout in another tab
  // also signs out this tab.
  yield call(waitForRelevantEvent, channel, (e) => e.type === EventTypes.REMOTE_LOGOUT);
  yield call(triggerLogout, { broadcast: false });
}

function* runTimerMode(channel, mode) {
  // Fall back to the safest known timer if the persisted mode is no longer recognized
  // (e.g. partially-applied migration, hand-edited DB) — better than silently disabling.
  const totalMs = MODE_DURATIONS_MS[mode] || MODE_DURATIONS_MS[AutoLogoutModes.MINUTES_30];

  while (true) {
    const phaseDuration = totalMs - WARNING_LEAD_MS;
    const idleResult = yield race({
      event: take(channel),
      timeout: delay(phaseDuration > 0 ? phaseDuration : 0),
    });

    if (idleResult.event) {
      const { type } = idleResult.event;
      if (type === EventTypes.REMOTE_LOGOUT) {
        yield call(triggerLogout, { broadcast: false });
        return;
      }
      if (type === EventTypes.LOCAL_ACTIVITY) {
        yield call(maybeBroadcastActivity);
      }
      // Any local/remote activity (or other events) just restarts the loop
      // eslint-disable-next-line no-continue
      continue;
    }

    // Timeout reached → show warning
    const expiresAt = Date.now() + WARNING_LEAD_MS;
    yield put(actions.showAutoLogoutWarning(expiresAt));

    const warningResult = yield race({
      dismiss: take(EntryActionTypes.AUTO_LOGOUT_WARNING_DISMISS),
      channel: call(waitForRelevantEvent, channel, (e) =>
        [
          EventTypes.REMOTE_LOGOUT,
          EventTypes.REMOTE_STAY_LOGGED_IN,
          EventTypes.REMOTE_ACTIVITY,
        ].includes(e.type),
      ),
      timeout: delay(WARNING_LEAD_MS),
    });

    if (warningResult.channel && warningResult.channel.type === EventTypes.REMOTE_LOGOUT) {
      yield call(triggerLogout, { broadcast: false });
      return;
    }

    yield put(actions.dismissAutoLogoutWarning());

    if (warningResult.timeout) {
      yield call(triggerLogout);
      return;
    }

    if (warningResult.dismiss) {
      yield call(broadcastStayLoggedIn);
    }
    // Loop continues — timer restarts (also resets when remote activity / stay-logged-in arrives)
  }
}

function* runMode(channel, mode) {
  if (!mode || mode === AutoLogoutModes.NEVER) {
    yield call(runIdleMode, channel);
    return;
  }

  yield call(runTimerMode, channel, mode);
}

function* waitForModeChange(currentMode) {
  while (true) {
    yield take(MODE_CHANGE_TRIGGER_TYPES);
    const nextMode = yield select(selectCurrentUserAutoLogoutMode);
    if (nextMode !== currentMode) {
      return nextMode;
    }
  }
}

function* autoLogout() {
  if (typeof window === 'undefined') {
    return;
  }

  const channel = yield call(createEventChannel);

  try {
    while (true) {
      const mode = yield select(selectCurrentUserAutoLogoutMode);

      const result = yield race({
        run: call(runMode, channel, mode),
        modeChanged: call(waitForModeChange, mode),
      });

      if (!('modeChanged' in result)) {
        // runMode completed without a mode change → logout already happened
        return;
      }
      // Mode changed mid-run: clear any visible warning before re-entering with new mode
      yield put(actions.dismissAutoLogoutWarning());
    }
  } finally {
    channel.close();
    if (yield cancelled()) {
      yield put(actions.dismissAutoLogoutWarning());
    }
  }
}

export default {
  autoLogout,
};
