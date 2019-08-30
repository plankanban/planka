import { call, put } from 'redux-saga/effects';

import request from './request';
import {
  createCardMembershipFailed,
  createCardMembershipRequested,
  createCardMembershipSucceeded,
  deleteCardMembershipFailed,
  deleteCardMembershipRequested,
  deleteCardMembershipSucceeded,
} from '../../../actions';
import api from '../../../api';

export function* createCardMembershipRequest(cardId, userId) {
  yield put(
    createCardMembershipRequested({
      cardId,
      userId,
    }),
  );

  try {
    const { item } = yield call(request, api.createCardMembership, cardId, {
      userId,
    });

    const action = createCardMembershipSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = createCardMembershipFailed(error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}

export function* deleteCardMembershipRequest(cardId, userId) {
  yield put(deleteCardMembershipRequested(cardId, userId));

  try {
    const { item } = yield call(request, api.deleteCardMembership, cardId, userId);

    const action = deleteCardMembershipSucceeded(item);
    yield put(action);

    return {
      success: true,
      payload: action.payload,
    };
  } catch (error) {
    const action = deleteCardMembershipFailed(cardId, userId, error);
    yield put(action);

    return {
      success: false,
      payload: action.payload,
    };
  }
}
