import EntryActionTypes from '../constants/EntryActionTypes';

const createCard = (listId, data, autoOpen) => ({
  type: EntryActionTypes.CARD_CREATE,
  payload: {
    listId,
    data,
    autoOpen,
  },
});

const handleCardCreate = (card) => ({
  type: EntryActionTypes.CARD_CREATE_HANDLE,
  payload: {
    card,
  },
});

const updateCard = (id, data) => ({
  type: EntryActionTypes.CARD_UPDATE,
  payload: {
    id,
    data,
  },
});

const updateCurrentCard = (data) => ({
  type: EntryActionTypes.CURRENT_CARD_UPDATE,
  payload: {
    data,
  },
});

const handleCardUpdate = (card) => ({
  type: EntryActionTypes.CARD_UPDATE_HANDLE,
  payload: {
    card,
  },
});

const moveCard = (id, listId, index) => ({
  type: EntryActionTypes.CARD_MOVE,
  payload: {
    id,
    listId,
    index,
  },
});

const moveCurrentCard = (listId, index) => ({
  type: EntryActionTypes.CURRENT_CARD_MOVE,
  payload: {
    listId,
    index,
  },
});

const transferCard = (id, boardId, listId, index) => ({
  type: EntryActionTypes.CARD_TRANSFER,
  payload: {
    id,
    boardId,
    listId,
    index,
  },
});

const transferCurrentCard = (boardId, listId, index) => ({
  type: EntryActionTypes.CURRENT_CARD_TRANSFER,
  payload: {
    boardId,
    listId,
    index,
  },
});

const duplicateCard = (id) => ({
  type: EntryActionTypes.CARD_DUPLICATE,
  payload: {
    id,
  },
});

const duplicateCurrentCard = () => ({
  type: EntryActionTypes.CURRENT_CARD_DUPLICATE,
  payload: {},
});

const deleteCard = (id) => ({
  type: EntryActionTypes.CARD_DELETE,
  payload: {
    id,
  },
});

const deleteCurrentCard = () => ({
  type: EntryActionTypes.CURRENT_CARD_DELETE,
  payload: {},
});

const handleCardDelete = (card) => ({
  type: EntryActionTypes.CARD_DELETE_HANDLE,
  payload: {
    card,
  },
});

const filterText = (text) => ({
  type: EntryActionTypes.TEXT_FILTER_IN_CURRENT_BOARD,
  payload: {
    text,
  },
});

export default {
  createCard,
  handleCardCreate,
  updateCard,
  updateCurrentCard,
  handleCardUpdate,
  moveCard,
  moveCurrentCard,
  transferCard,
  transferCurrentCard,
  duplicateCard,
  duplicateCurrentCard,
  deleteCard,
  deleteCurrentCard,
  handleCardDelete,
  filterText,
};
