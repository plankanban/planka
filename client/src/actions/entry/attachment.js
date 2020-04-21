import EntryActionTypes from '../../constants/EntryActionTypes';

export const createAttachmentInCurrentCard = (data) => ({
  type: EntryActionTypes.ATTACHMENT_IN_CURRENT_CARD_CREATE,
  payload: {
    data,
  },
});

export const updateAttachment = (id, data) => ({
  type: EntryActionTypes.ATTACHMENT_UPDATE,
  payload: {
    id,
    data,
  },
});

export const deleteAttachment = (id) => ({
  type: EntryActionTypes.ATTACHMENT_DELETE,
  payload: {
    id,
  },
});
