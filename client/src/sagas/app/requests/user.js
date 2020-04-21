import { call, put } from 'redux-saga/effects';

import request from './request';
import {
  createUserFailed,
  createUserRequested,
  createUserSucceeded,
  deleteUserFailed,
  deleteUserRequested,
  deleteUserSucceeded,
  fetchCurrentUserFailed,
  fetchCurrentUserRequested,
  fetchCurrentUserSucceeded,
  updateUserAvatarFailed,
  updateUserAvatarRequested,
  updateUserAvatarSucceeded,
  updateUserEmailFailed,
  updateUserEmailRequested,
  updateUserEmailSucceeded,
  updateUserFailed,
  updateUserPasswordFailed,
  updateUserPasswordRequested,
  updateUserPasswordSucceeded,
  updateUserRequested,
  updateUserSucceeded,
  updateUserUsernameFailed,
  updateUserUsernameRequested,
  updateUserUsernameSucceeded,
} from '../../../actions';
import api from '../../../api';

export function* createUserRequest(data) {
  yield put(createUserRequested(data));

  try {
    const { item } = yield call(request, api.createUser, data);

    const action = createUserSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = createUserFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* fetchCurrentUserRequest() {
  yield put(fetchCurrentUserRequested());

  try {
    const { item } = yield call(request, api.getCurrentUser);

    const action = fetchCurrentUserSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = fetchCurrentUserFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* updateUserRequest(id, data) {
  yield put(updateUserRequested(id, data));

  try {
    const { item } = yield call(request, api.updateUser, id, data);

    const action = updateUserSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = updateUserFailed(id, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* updateUserEmailRequest(id, data) {
  yield put(updateUserEmailRequested(id, data));

  try {
    const { item } = yield call(request, api.updateUserEmail, id, data);

    const action = updateUserEmailSucceeded(id, item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = updateUserEmailFailed(id, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* updateUserPasswordRequest(id, data) {
  yield put(updateUserPasswordRequested(id, data));

  try {
    yield call(request, api.updateUserPassword, id, data);

    const action = updateUserPasswordSucceeded(id);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = updateUserPasswordFailed(id, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* updateUserUsernameRequest(id, data) {
  yield put(updateUserUsernameRequested(id, data));

  try {
    const { item } = yield call(request, api.updateUserUsername, id, data);

    const action = updateUserUsernameSucceeded(id, item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = updateUserUsernameFailed(id, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* updateUserAvatarRequest(id, data) {
  yield put(updateUserAvatarRequested(id));

  try {
    const { item } = yield call(request, api.updateUserAvatar, id, data);

    const action = updateUserAvatarSucceeded(id, item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = updateUserAvatarFailed(id, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* deleteUserRequest(id) {
  yield put(deleteUserRequested(id));

  try {
    const { item } = yield call(request, api.deleteUser, id);

    const action = deleteUserSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = deleteUserFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}
