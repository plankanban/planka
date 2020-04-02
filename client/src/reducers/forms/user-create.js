import ActionTypes from '../../constants/ActionTypes';

const initialState = {
  data: {
    email: '',
    name: '',
    username: '',
  },
  isSubmitting: false,
  error: null,
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.USER_CREATE:
      return {
        ...state,
        data: {
          ...state.data,
          ...payload.data,
        },
      };
    case ActionTypes.USER_CREATE_ERROR_CLEAR:
      return {
        ...state,
        error: null,
      };
    case ActionTypes.USER_CREATE_REQUESTED:
      return {
        ...state,
        isSubmitting: true,
      };
    case ActionTypes.USER_CREATE_SUCCEEDED:
      return initialState;
    case ActionTypes.USER_CREATE_FAILED:
      return {
        ...state,
        isSubmitting: false,
        error: payload.error,
      };
    default:
      return state;
  }
};
