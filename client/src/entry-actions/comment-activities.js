import EntryActionTypes from '../constants/EntryActionTypes';

const createCommentActivityInCurrentCard = (data) => ({
  type: EntryActionTypes.COMMENT_ACTIVITY_IN_CURRENT_CARD_CREATE,
  payload: {
    data,
  },
});

const updateCommentActivity = (id, data) => ({
  type: EntryActionTypes.COMMENT_ACTIVITY_UPDATE,
  payload: {
    id,
    data,
  },
});

const deleteCommentActivity = (id) => ({
  type: EntryActionTypes.COMMENT_ACTIVITY_DELETE,
  payload: {
    id,
  },
});

export default {
  createCommentActivityInCurrentCard,
  updateCommentActivity,
  deleteCommentActivity,
};
