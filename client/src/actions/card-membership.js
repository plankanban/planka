import ActionTypes from '../constants/ActionTypes';

/* Events */

export const createCardMembershipRequested = (data) => ({
  type: ActionTypes.CARD_MEMBERSHIP_CREATE_REQUESTED,
  payload: {
    data,
  },
});

export const createCardMembershipSucceeded = (cardMembership) => ({
  type: ActionTypes.CARD_MEMBERSHIP_CREATE_SUCCEEDED,
  payload: {
    cardMembership,
  },
});

export const createCardMembershipFailed = (error) => ({
  type: ActionTypes.CARD_MEMBERSHIP_CREATE_FAILED,
  payload: {
    error,
  },
});

export const createCardMembershipReceived = (cardMembership) => ({
  type: ActionTypes.CARD_MEMBERSHIP_CREATE_RECEIVED,
  payload: {
    cardMembership,
  },
});

export const deleteCardMembershipRequested = (cardId, userId) => ({
  type: ActionTypes.CARD_MEMBERSHIP_DELETE_REQUESTED,
  payload: {
    cardId,
    userId,
  },
});

export const deleteCardMembershipSucceeded = (cardMembership) => ({
  type: ActionTypes.CARD_MEMBERSHIP_DELETE_SUCCEEDED,
  payload: {
    cardMembership,
  },
});

export const deleteCardMembershipFailed = (cardId, userId, error) => ({
  type: ActionTypes.CARD_MEMBERSHIP_DELETE_FAILED,
  payload: {
    cardId,
    userId,
    error,
  },
});

export const deleteCardMembershipReceived = (cardMembership) => ({
  type: ActionTypes.CARD_MEMBERSHIP_DELETE_RECEIVED,
  payload: {
    cardMembership,
  },
});
