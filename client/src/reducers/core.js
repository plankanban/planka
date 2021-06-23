import { LOCATION_CHANGE } from 'connected-react-router';

import ActionTypes from '../constants/ActionTypes';
import ModalTypes from '../constants/ModalTypes';

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
    case ActionTypes.CORE_INITIALIZE:
      return {
        ...state,
        isInitializing: false,
      };
    case ActionTypes.MODAL_OPEN:
      return {
        ...state,
        currentModal: payload.type,
      };
    case ActionTypes.USER_UPDATE_HANDLE:
      if (state.currentModal === ModalTypes.USERS && payload.isCurrent && !payload.user.isAdmin) {
        return {
          ...state,
          currentModal: null,
        };
      }

      return state;
    case ActionTypes.PROJECT_MANAGER_DELETE:
    case ActionTypes.PROJECT_MANAGER_DELETE_HANDLE:
      if (
        state.currentModal === ModalTypes.PROJECT_SETTINGS &&
        payload.isCurrentUser &&
        payload.isCurrentProject
      ) {
        return {
          ...state,
          currentModal: null,
        };
      }

      return state;
    default:
      return state;
  }
};
