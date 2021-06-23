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
        isSubmitting: true,
      };
    case ActionTypes.AUTHENTICATE__SUCCESS:
      return initialState;
    case ActionTypes.AUTHENTICATE__FAILURE:
      return {
        ...state,
        isSubmitting: false,
        error: payload.error,
      };
    case ActionTypes.AUTHENTICATE_ERROR_CLEAR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};
