import socket from './socket';
import { transformAttachment } from './attachments';

/* Transformers */

export const transformCard = (card) => ({
  ...card,
  ...(card.dueDate && {
    dueDate: new Date(card.dueDate),
  }),
  ...(card.stopwatch && {
    stopwatch: {
      ...card.stopwatch,
      ...(card.stopwatch.startedAt && {
        startedAt: new Date(card.stopwatch.startedAt),
      }),
    },
  }),
});

export const transformCardData = (data) => ({
  ...data,
  ...(data.dueDate && {
    dueDate: data.dueDate.toISOString(),
  }),
  ...(data.stopwatch && {
    stopwatch: {
      ...data.stopwatch,
      ...(data.stopwatch.startedAt && {
        startedAt: data.stopwatch.startedAt.toISOString(),
      }),
    },
  }),
});

/* Actions */

const createCard = (listId, data, headers) =>
  socket.post(`/lists/${listId}/cards`, transformCardData(data), headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
  }));

const getCard = (id, headers) =>
  socket.get(`/cards/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
    included: {
      ...body.included,
      attachments: body.included.attachments.map(transformAttachment),
    },
  }));

const updateCard = (id, data, headers) =>
  socket.patch(`/cards/${id}`, transformCardData(data), headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
  }));

const duplicateCard = (id, data, headers) =>
  socket.post(`/cards/${id}/duplicate`, data, headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
  }));

const deleteCard = (id, headers) =>
  socket.delete(`/cards/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
  }));

/* Event handlers */

const makeHandleCardCreate = (next) => (body) => {
  next({
    ...body,
    item: transformCard(body.item),
  });
};

const makeHandleCardUpdate = makeHandleCardCreate;

const makeHandleCardDelete = makeHandleCardCreate;

export default {
  createCard,
  getCard,
  updateCard,
  deleteCard,
  duplicateCard,
  makeHandleCardCreate,
  makeHandleCardUpdate,
  makeHandleCardDelete,
};
