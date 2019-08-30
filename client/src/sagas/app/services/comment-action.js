import { call, put, select } from 'redux-saga/effects';

import {
  createCommentActionRequest,
  deleteCommentActionRequest,
  updateCommentActionRequest,
} from '../requests';
import { currentUserIdSelector, maxIdSelector, pathSelector } from '../../../selectors';
import { createCommentAction, deleteCommentAction, updateCommentAction } from '../../../actions';
import { nextLocalId } from '../../../utils/local-id';
import { Action } from '../../../models';
import { ActionTypes } from '../../../constants/Enums';

export function* createCommentActionService(cardId, data) {
  const localId = nextLocalId(yield select(maxIdSelector, Action.modelName));
  const userId = yield select(currentUserIdSelector);

  yield put(
    createCommentAction({
      cardId,
      userId,
      data,
      id: localId,
      type: ActionTypes.COMMENT_CARD,
    }),
  );

  yield call(createCommentActionRequest, cardId, localId, data);
}

export function* createCommentActionInCurrentCardService(data) {
  const { cardId } = yield select(pathSelector);

  yield call(createCommentActionService, cardId, data);
}

export function* updateCommentActionService(id, data) {
  yield put(updateCommentAction(id, data));
  yield call(updateCommentActionRequest, id, data);
}

export function* deleteCommentActionService(id) {
  yield put(deleteCommentAction(id));
  yield call(deleteCommentActionRequest, id);
}
