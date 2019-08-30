import EntryActionTypes from '../../constants/EntryActionTypes';

export const createCommentActionInCurrentCard = (data) => ({
  type: EntryActionTypes.COMMENT_ACTION_IN_CURRENT_CARD_CREATE,
  payload: {
    data,
  },
});

export const updateCommentAction = (id, data) => ({
  type: EntryActionTypes.COMMENT_ACTION_UPDATE,
  payload: {
    id,
    data,
  },
});

export const deleteCommentAction = (id) => ({
  type: EntryActionTypes.COMMENT_ACTION_DELETE,
  payload: {
    id,
  },
});
