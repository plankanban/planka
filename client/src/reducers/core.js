import { LOCATION_CHANGE } from 'connected-react-router';

import ActionTypes from '../constants/ActionTypes';

const initialState = {
  isInitializing: true,
  currentModal: null,
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case LOCATION_CHANGE:
    case ActionTypes.MODAL_CLOSE:
      return {
        ...state,
        currentModal: null,
      };
    case ActionTypes.CORE_INITIALIZED:
      return {
        ...state,
        isInitializing: false,
      };
    case ActionTypes.MODAL_OPEN:
      return {
        ...state,
        currentModal: payload.type,
      };
    default:
      return state;
  }
};
