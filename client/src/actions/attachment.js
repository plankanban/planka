import ActionTypes from '../constants/ActionTypes';

export const createAttachment = (attachment) => ({
  type: ActionTypes.ATTACHMENT_CREATE,
  payload: {
    attachment,
  },
});

createAttachment.success = (localId, attachment) => ({
  type: ActionTypes.ATTACHMENT_CREATE__SUCCESS,
  payload: {
    localId,
    attachment,
  },
});

createAttachment.failure = (localId, error) => ({
  type: ActionTypes.ATTACHMENT_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

export const handleAttachmentCreate = (attachment) => ({
  type: ActionTypes.ATTACHMENT_CREATE_HANDLE,
  payload: {
    attachment,
  },
});

export const updateAttachment = (id, data) => ({
  type: ActionTypes.ATTACHMENT_UPDATE,
  payload: {
    id,
    data,
  },
});

updateAttachment.success = (attachment) => ({
  type: ActionTypes.ATTACHMENT_UPDATE__SUCCESS,
  payload: {
    attachment,
  },
});

updateAttachment.failure = (id, error) => ({
  type: ActionTypes.ATTACHMENT_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

export const handleAttachmentUpdate = (attachment) => ({
  type: ActionTypes.ATTACHMENT_UPDATE_HANDLE,
  payload: {
    attachment,
  },
});

export const deleteAttachment = (id) => ({
  type: ActionTypes.ATTACHMENT_DELETE,
  payload: {
    id,
  },
});

deleteAttachment.success = (attachment) => ({
  type: ActionTypes.ATTACHMENT_DELETE__SUCCESS,
  payload: {
    attachment,
  },
});

deleteAttachment.failure = (id, error) => ({
  type: ActionTypes.ATTACHMENT_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

export const handleAttachmentDelete = (attachment) => ({
  type: ActionTypes.ATTACHMENT_DELETE_HANDLE,
  payload: {
    attachment,
  },
});
