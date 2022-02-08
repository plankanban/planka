import ActionTypes from '../constants/ActionTypes';

const initialState = {
  isDisconnected: false,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type }) => {
  switch (type) {
    case ActionTypes.SOCKET_DISCONNECT_HANDLE:
      return {
        ...state,
        isDisconnected: true,
      };
    case ActionTypes.SOCKET_RECONNECT_HANDLE:
      return {
        ...state,
        isDisconnected: false,
      };
    default:
      return state;
  }
};
