import http from './http';
import socket from './socket';

/* Transformers */

export const transformAttachment = (attachment) => ({
  ...attachment,
  createdAt: new Date(attachment.createdAt),
});

/* Actions */

const createAttachment = (cardId, data, requestId) =>
  http.post(`/cards/${cardId}/attachments?requestId=${requestId}`, data).then((body) => ({
    ...body,
    item: transformAttachment(body.item),
  }));

const updateAttachment = (id, data) =>
  socket.patch(`/attachments/${id}`, data).then((body) => ({
    ...body,
    item: transformAttachment(body.item),
  }));

const deleteAttachment = (id) =>
  socket.delete(`/attachments/${id}`).then((body) => ({
    ...body,
    item: transformAttachment(body.item),
  }));

/* Event handlers */

const makeHandleAttachmentCreate = (next) => (body) => {
  next({
    ...body,
    item: transformAttachment(body.item),
  });
};

const makeHandleAttachmentUpdate = makeHandleAttachmentCreate;

const makeHandleAttachmentDelete = makeHandleAttachmentCreate;

export default {
  createAttachment,
  updateAttachment,
  deleteAttachment,
  makeHandleAttachmentCreate,
  makeHandleAttachmentUpdate,
  makeHandleAttachmentDelete,
};
