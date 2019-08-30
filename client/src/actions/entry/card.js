import EntryActionTypes from '../../constants/EntryActionTypes';

export const createCard = (listId, data) => ({
  type: EntryActionTypes.CARD_CREATE,
  payload: {
    listId,
    data,
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

export const moveCard = (id, listId, index) => ({
  type: EntryActionTypes.CARD_MOVE,
  payload: {
    id,
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
