import EntryActionTypes from '../../constants/EntryActionTypes';

export const createAttachmentInCurrentCard = (data) => ({
  type: EntryActionTypes.ATTACHMENT_IN_CURRENT_CARD_CREATE,
  payload: {
    data,
  },
});

export const handleAttachmentCreate = (attachment, requestId) => ({
  type: EntryActionTypes.ATTACHMENT_CREATE_HANDLE,
  payload: {
    attachment,
    requestId,
  },
});

export const updateAttachment = (id, data) => ({
  type: EntryActionTypes.ATTACHMENT_UPDATE,
  payload: {
    id,
    data,
  },
});

export const handleAttachmentUpdate = (attachment) => ({
  type: EntryActionTypes.ATTACHMENT_UPDATE_HANDLE,
  payload: {
    attachment,
  },
});

export const deleteAttachment = (id) => ({
  type: EntryActionTypes.ATTACHMENT_DELETE,
  payload: {
    id,
  },
});

export const handleAttachmentDelete = (attachment) => ({
  type: EntryActionTypes.ATTACHMENT_DELETE_HANDLE,
  payload: {
    attachment,
  },
});
