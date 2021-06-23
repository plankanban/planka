import EntryActionTypes from '../../constants/EntryActionTypes';

export const createCard = (listId, data) => ({
  type: EntryActionTypes.CARD_CREATE,
  payload: {
    listId,
    data,
  },
});

export const handleCardCreate = (card) => ({
  type: EntryActionTypes.CARD_CREATE_HANDLE,
  payload: {
    card,
  },
});

export const updateCard = (id, data) => ({
  type: EntryActionTypes.CARD_UPDATE,
  payload: {
    id,
    data,
  },
});

export const updateCurrentCard = (data) => ({
  type: EntryActionTypes.CURRENT_CARD_UPDATE,
  payload: {
    data,
  },
});

export const handleCardUpdate = (card) => ({
  type: EntryActionTypes.CARD_UPDATE_HANDLE,
  payload: {
    card,
  },
});

export const moveCard = (id, listId, index = 0) => ({
  type: EntryActionTypes.CARD_MOVE,
  payload: {
    id,
    listId,
    index,
  },
});

export const moveCurrentCard = (listId, index = 0) => ({
  type: EntryActionTypes.CURRENT_CARD_MOVE,
  payload: {
    listId,
    index,
  },
});

export const transferCard = (id, boardId, listId, index = 0) => ({
  type: EntryActionTypes.CARD_TRANSFER,
  payload: {
    id,
    boardId,
    listId,
    index,
  },
});

export const transferCurrentCard = (boardId, listId, index = 0) => ({
  type: EntryActionTypes.CURRENT_CARD_TRANSFER,
  payload: {
    boardId,
    listId,
    index,
  },
});

export const deleteCard = (id) => ({
  type: EntryActionTypes.CARD_DELETE,
  payload: {
    id,
  },
});

export const deleteCurrentCard = () => ({
  type: EntryActionTypes.CURRENT_CARD_DELETE,
  payload: {},
});

export const handleCardDelete = (card) => ({
  type: EntryActionTypes.CARD_DELETE_HANDLE,
  payload: {
    card,
  },
});
