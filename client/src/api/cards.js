import socket from './socket';
import { transformAttachment } from './attachments';

/* Transformers */

export const transformCard = (card) => ({
  ...card,
  ...(card.dueDate && {
    dueDate: new Date(card.dueDate),
  }),
  ...(card.timer && {
    timer: {
      ...card.timer,
      ...(card.timer.startedAt && {
        startedAt: new Date(card.timer.startedAt),
      }),
    },
  }),
});

export const transformCardData = (data) => ({
  ...data,
  ...(data.dueDate && {
    dueDate: data.dueDate.toISOString(),
  }),
  ...(data.timer && {
    timer: {
      ...data.timer,
      ...(data.timer.startedAt && {
        startedAt: data.timer.startedAt.toISOString(),
      }),
    },
  }),
});

/* Actions */

const getCards = (boardId, data, headers) =>
  socket.get(`/board/${boardId}/cards`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformCard),
    included: {
      ...body.included,
      attachments: body.included.attachments.map(transformAttachment),
    },
  }));

const createCard = (boardId, data, headers) =>
  socket.post(`/boards/${boardId}/cards`, transformCardData(data), headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
  }));

const getCard = (id, headers) =>
  socket.get(`/cards/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
  }));

const updateCard = (id, data, headers) =>
  socket.patch(`/cards/${id}`, transformCardData(data), headers).then((body) => ({
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

const makeHandleCardUpdate = (next) => (body) => {
  next({
    ...body,
    item: transformCard(body.item),
  });
};

const makeHandleCardDelete = makeHandleCardUpdate;

export default {
  getCards,
  createCard,
  getCard,
  updateCard,
  deleteCard,
  makeHandleCardCreate,
  makeHandleCardUpdate,
  makeHandleCardDelete,
};
