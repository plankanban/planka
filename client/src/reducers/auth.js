import ActionTypes from '../constants/ActionTypes';

const initialState = {
  userId: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
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
