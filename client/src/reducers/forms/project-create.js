import ActionTypes from '../../constants/ActionTypes';

const initialState = {
  data: {
    name: '',
  },
  isSubmitting: false,
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.PROJECT_CREATE:
      return {
        ...state,
        data: {
          ...state.data,
          ...payload.data,
        },
      };
    case ActionTypes.PROJECT_CREATE_REQUESTED:
      return {
        ...state,
        isSubmitting: true,
      };
    case ActionTypes.PROJECT_CREATE_SUCCEEDED:
      return initialState;
    case ActionTypes.PROJECT_CREATE_FAILED:
      return {
        ...state,
        isSubmitting: false,
      };
    default:
      return state;
  }
};
