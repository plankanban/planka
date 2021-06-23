import EntryActionTypes from '../../constants/EntryActionTypes';

export const createLabelInCurrentBoard = (data) => ({
  type: EntryActionTypes.LABEL_IN_CURRENT_BOARD_CREATE,
  payload: {
    data,
  },
});

export const handleLabelCreate = (label) => ({
  type: EntryActionTypes.LABEL_CREATE_HANDLE,
  payload: {
    label,
  },
});

export const updateLabel = (id, data) => ({
  type: EntryActionTypes.LABEL_UPDATE,
  payload: {
    id,
    data,
  },
});

export const handleLabelUpdate = (label) => ({
  type: EntryActionTypes.LABEL_UPDATE_HANDLE,
  payload: {
    label,
  },
});

export const deleteLabel = (id) => ({
  type: EntryActionTypes.LABEL_DELETE,
  payload: {
    id,
  },
});

export const handleLabelDelete = (label) => ({
  type: EntryActionTypes.LABEL_DELETE_HANDLE,
  payload: {
    label,
  },
});

export const addLabelToCard = (id, cardId) => ({
  type: EntryActionTypes.LABEL_TO_CARD_ADD,
  payload: {
    id,
    cardId,
  },
});

export const addLabelToCurrentCard = (id) => ({
  type: EntryActionTypes.LABEL_TO_CURRENT_CARD_ADD,
  payload: {
    id,
  },
});

export const handleLabelToCardAdd = (cardLabel) => ({
  type: EntryActionTypes.LABEL_TO_CARD_ADD_HANDLE,
  payload: {
    cardLabel,
  },
});

export const removeLabelFromCard = (id, cardId) => ({
  type: EntryActionTypes.LABEL_FROM_CARD_REMOVE,
  payload: {
    id,
    cardId,
  },
});

export const removeLabelFromCurrentCard = (id) => ({
  type: EntryActionTypes.LABEL_FROM_CURRENT_CARD_REMOVE,
  payload: {
    id,
  },
});

export const handleLabelFromCardRemove = (cardLabel) => ({
  type: EntryActionTypes.LABEL_FROM_CARD_REMOVE_HANDLE,
  payload: {
    cardLabel,
  },
});

export const addLabelToFilterInCurrentBoard = (id) => ({
  type: EntryActionTypes.LABEL_TO_FILTER_IN_CURRENT_BOARD_ADD,
  payload: {
    id,
  },
});

export const removeLabelFromFilterInCurrentBoard = (id) => ({
  type: EntryActionTypes.LABEL_FROM_FILTER_IN_CURRENT_BOARD_REMOVE,
  payload: {
    id,
  },
});
