import ActionTypes from '../constants/ActionTypes';

const initialState = {
  isInitializing: true,
  config: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.LOGIN_INITIALIZE:
      return {
        ...state,
        isInitializing: false,
        config: payload.config,
      };
    case ActionTypes.AUTHENTICATE__SUCCESS:
    case ActionTypes.USING_OIDC_AUTHENTICATE__SUCCESS:
      return {
        ...state,
        isInitializing: true,
      };
    case ActionTypes.CORE_INITIALIZE:
      return {
        ...state,
        isInitializing: false,
      };
    case ActionTypes.CORE_INITIALIZE__CONFIG_FETCH:
      return {
        ...state,
        config: payload.config,
      };
    default:
      return state;
  }
};
