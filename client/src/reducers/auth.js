import { getAccessToken } from '../utils/access-token-storage';
import ActionTypes from '../constants/ActionTypes';

const initialState = {
  accessToken: getAccessToken(),
  userId: null,
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.AUTHENTICATE_SUCCEEDED:
      return {
        ...state,
        accessToken: payload.accessToken,
      };
    case ActionTypes.CURRENT_USER_FETCH_SUCCEEDED:
      return {
        ...state,
        userId: payload.user.id,
      };
    default:
      return state;
  }
};
