import ActionTypes from '../../constants/ActionTypes';

const initialState = {
  data: {
    name: '',
  },
  isSubmitting: false,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.PROJECT_CREATE:
      return {
        ...state,
        data: {
          ...state.data,
          ...payload.data,
        },
        isSubmitting: true,
      };
    case ActionTypes.PROJECT_CREATE__SUCCESS:
      return initialState;
    case ActionTypes.PROJECT_CREATE__FAILURE:
      return {
        ...state,
        isSubmitting: false,
      };
    default:
      return state;
  }
};
