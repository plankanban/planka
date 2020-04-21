import ActionTypes from '../constants/ActionTypes';

/* Actions */

export const createAttachment = (attachment) => ({
  type: ActionTypes.ATTACHMENT_CREATE,
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

export const deleteAttachment = (id) => ({
  type: ActionTypes.ATTACHMENT_DELETE,
  payload: {
    id,
  },
});

/* Events */

export const createAttachmentRequested = (localId, data) => ({
  type: ActionTypes.ATTACHMENT_CREATE_REQUESTED,
  payload: {
    localId,
    data,
  },
});

export const createAttachmentSucceeded = (localId, attachment) => ({
  type: ActionTypes.ATTACHMENT_CREATE_SUCCEEDED,
  payload: {
    localId,
    attachment,
  },
});

export const createAttachmentFailed = (localId, error) => ({
  type: ActionTypes.ATTACHMENT_CREATE_FAILED,
  payload: {
    localId,
    error,
  },
});

export const createAttachmentReceived = (attachment) => ({
  type: ActionTypes.ATTACHMENT_CREATE_RECEIVED,
  payload: {
    attachment,
  },
});

export const updateAttachmentRequested = (id, data) => ({
  type: ActionTypes.ATTACHMENT_UPDATE_REQUESTED,
  payload: {
    id,
    data,
  },
});

export const updateAttachmentSucceeded = (attachment) => ({
  type: ActionTypes.ATTACHMENT_UPDATE_SUCCEEDED,
  payload: {
    attachment,
  },
});

export const updateAttachmentFailed = (id, error) => ({
  type: ActionTypes.ATTACHMENT_UPDATE_FAILED,
  payload: {
    id,
    error,
  },
});

export const updateAttachmentReceived = (attachment) => ({
  type: ActionTypes.ATTACHMENT_UPDATE_RECEIVED,
  payload: {
    attachment,
  },
});

export const deleteAttachmentRequested = (id) => ({
  type: ActionTypes.ATTACHMENT_DELETE_REQUESTED,
  payload: {
    id,
  },
});

export const deleteAttachmentSucceeded = (attachment) => ({
  type: ActionTypes.ATTACHMENT_DELETE_SUCCEEDED,
  payload: {
    attachment,
  },
});

export const deleteAttachmentFailed = (id, error) => ({
  type: ActionTypes.ATTACHMENT_DELETE_FAILED,
  payload: {
    id,
    error,
  },
});

export const deleteAttachmentReceived = (attachment) => ({
  type: ActionTypes.ATTACHMENT_DELETE_RECEIVED,
  payload: {
    attachment,
  },
});
