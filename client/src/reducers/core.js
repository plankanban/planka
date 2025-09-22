/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { LOCATION_CHANGE_HANDLE } from '../lib/redux-router';

import ActionTypes from '../constants/ActionTypes';
import ModalTypes from '../constants/ModalTypes';
import { HomeViews, ProjectOrders } from '../constants/Enums';

const initialState = {
  isContentFetching: false,
  isLogouting: false,
  isFavoritesEnabled: false,
  isEditModeEnabled: false,
  modal: null,
  config: null,
  boardId: null,
  cardId: null,
  recentCardId: null,
  prevCardIds: [],
  homeView: HomeViews.GROUPED_PROJECTS,
  projectsSearch: '',
  projectsOrder: ProjectOrders.BY_DEFAULT,
  isHiddenProjectsVisible: false, // TODO: refactor?
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case LOCATION_CHANGE_HANDLE:
    case ActionTypes.MODAL_CLOSE:
      return {
        ...state,
        modal: null,
      };
    case ActionTypes.LOCATION_CHANGE_HANDLE: {
      const nextState = {
        ...state,
        isContentFetching: false,
        boardId: payload.currentBoardId,
        cardId: payload.currentCardId,
      };

      if (payload.currentCardId) {
        nextState.recentCardId = payload.currentCardId;
      } else if (nextState.boardId !== state.boardId) {
        nextState.recentCardId = null;
      }

      if (payload.currentCardId) {
        if (state.cardId) {
          nextState.prevCardIds =
            payload.currentCardId === nextState.prevCardIds.at(-1)
              ? [...nextState.prevCardIds.slice(0, -1)]
              : [...nextState.prevCardIds, state.cardId];
        }
      } else if (nextState.prevCardIds.length > 0) {
        nextState.prevCardIds = [];
      }

      if (payload.isEditModeEnabled !== undefined) {
        nextState.isEditModeEnabled = payload.isEditModeEnabled;
      }

      return nextState;
    }
    case ActionTypes.LOCATION_CHANGE_HANDLE__CONTENT_FETCH:
      return {
        ...state,
        isContentFetching: true,
      };
    case ActionTypes.SOCKET_RECONNECT_HANDLE:
    case ActionTypes.USER_UPDATE_HANDLE:
      if (payload.config) {
        return {
          ...state,
          config: payload.config,
        };
      }

      return state;
    case ActionTypes.CORE_INITIALIZE: {
      const nextState = {
        ...state,
        isFavoritesEnabled: payload.user.enableFavoritesByDefault,
        homeView: payload.user.defaultHomeView,
        projectsOrder: payload.user.defaultProjectsOrder,
      };

      if (payload.config) {
        nextState.config = payload.config;
      }

      return nextState;
    }
    case ActionTypes.FAVORITES_TOGGLE:
      return {
        ...state,
        isFavoritesEnabled: payload.isEnabled,
      };
    case ActionTypes.EDIT_MODE_TOGGLE:
      return {
        ...state,
        isEditModeEnabled: payload.isEnabled,
      };
    case ActionTypes.HOME_VIEW_UPDATE:
      return {
        ...state,
        homeView: payload.value,
      };
    case ActionTypes.LOGOUT__ACCESS_TOKEN_REVOKE:
      return {
        ...state,
        isLogouting: true,
      };
    case ActionTypes.MODAL_OPEN:
      return {
        ...state,
        modal: payload,
      };
    case ActionTypes.CONFIG_UPDATE:
      return {
        ...state,
        config: {
          ...state.config,
          ...payload.data,
        },
      };
    case ActionTypes.CONFIG_UPDATE__SUCCESS:
      return {
        ...state,
        config: {
          ...state.config,
          ...payload.config,
        },
      };
    case ActionTypes.CONFIG_UPDATE_HANDLE:
      return {
        ...state,
        config: payload.config,
      };
    case ActionTypes.PROJECTS_SEARCH:
      return {
        ...state,
        projectsSearch: payload.value,
      };
    case ActionTypes.PROJECTS_ORDER_UPDATE:
      return {
        ...state,
        projectsOrder: payload.value,
      };
    case ActionTypes.HIDDEN_PROJECTS_TOGGLE:
      return {
        ...state,
        isHiddenProjectsVisible: payload.isVisible,
      };
    case ActionTypes.BOARD_DELETE:
      if (
        state.modal &&
        state.modal.type === ModalTypes.BOARD_SETTINGS &&
        state.modal.params.id === payload.id
      ) {
        return {
          ...state,
          modal: null,
        };
      }

      return state;
    case ActionTypes.BOARD_DELETE_HANDLE:
      if (
        state.modal &&
        state.modal.type === ModalTypes.BOARD_SETTINGS &&
        state.modal.params.id === payload.board.id
      ) {
        return {
          ...state,
          modal: null,
        };
      }

      return state;
    default:
      return state;
  }
};
