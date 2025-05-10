/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import http from './http';
import socket from './socket';

/* Transformers */

export const transformAttachment = (attachment) => ({
  ...attachment,
  ...(attachment.createdAt && {
    createdAt: new Date(attachment.createdAt),
  }),
});

/* Actions */

const createAttachment = (cardId, data, headers) =>
  socket.post(`/cards/${cardId}/attachments`, data, headers).then((body) => ({
    ...body,
    item: transformAttachment(body.item),
  }));

const createAttachmentWithFile = (cardId, { file, ...data }, requestId, headers) =>
  http
    .post(
      `/cards/${cardId}/attachments?requestId=${requestId}`,
      {
        ...data,
        file,
      },
      headers,
    )
    .then((body) => ({
      ...body,
      item: transformAttachment(body.item),
    }));

const updateAttachment = (id, data, headers) =>
  socket.patch(`/attachments/${id}`, data, headers).then((body) => ({
    ...body,
    item: transformAttachment(body.item),
  }));

const deleteAttachment = (id, headers) =>
  socket.delete(`/attachments/${id}`, undefined, headers).then((body) => ({
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
  createAttachmentWithFile,
  updateAttachment,
  deleteAttachment,
  makeHandleAttachmentCreate,
  makeHandleAttachmentUpdate,
  makeHandleAttachmentDelete,
};
