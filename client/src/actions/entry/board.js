import EntryActionTypes from '../../constants/EntryActionTypes';

export const createBoardInCurrentProject = (data) => ({
  type: EntryActionTypes.BOARD_IN_CURRENT_PROJECT_CREATE,
  payload: {
    data,
  },
});

export const fetchBoard = (id) => ({
  type: EntryActionTypes.BOARD_FETCH,
  payload: {
    id,
  },
});

export const updateBoard = (id, data) => ({
  type: EntryActionTypes.BOARD_UPDATE,
  payload: {
    id,
    data,
  },
});

export const moveBoard = (id, index) => ({
  type: EntryActionTypes.BOARD_MOVE,
  payload: {
    id,
    index,
  },
});

export const deleteBoard = (id) => ({
  type: EntryActionTypes.BOARD_DELETE,
  payload: {
    id,
  },
});
