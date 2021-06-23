import { getAccessToken } from '../utils/access-token-storage';
import ActionTypes from '../constants/ActionTypes';

const initialState = {
  accessToken: getAccessToken(),
  userId: null,
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.AUTHENTICATE__SUCCESS:
      return {
        ...state,
        accessToken: payload.accessToken,
      };
    case ActionTypes.SOCKET_RECONNECT_HANDLE:
    case ActionTypes.CORE_INITIALIZE:
      return {
        ...state,
        userId: payload.user.id,
      };
    default:
      return state;
  }
};
