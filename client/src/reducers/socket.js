import ActionTypes from '../constants/ActionTypes';

const initialState = {
  status: null,
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.SOCKET_STATUS_CHANGED:
      return {
        ...state,
        status: payload.status,
      };
    default:
      return state;
  }
};
