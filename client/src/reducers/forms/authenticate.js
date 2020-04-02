import ActionTypes from '../../constants/ActionTypes';

const initialState = {
  data: {
    emailOrUsername: '',
    password: '',
  },
  isSubmitting: false,
  error: null,
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.AUTHENTICATE:
      return {
        ...state,
        data: {
          ...state.data,
          ...payload.data,
        },
      };
    case ActionTypes.AUTHENTICATE_ERROR_CLEAR:
      return {
        ...state,
        error: null,
      };
    case ActionTypes.AUTHENTICATE_REQUESTED:
      return {
        ...state,
        isSubmitting: true,
      };
    case ActionTypes.AUTHENTICATE_SUCCEEDED:
      return initialState;
    case ActionTypes.AUTHENTICATE_FAILED:
      return {
        ...state,
        isSubmitting: false,
        error: payload.error,
      };
    default:
      return state;
  }
};
