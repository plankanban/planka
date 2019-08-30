import socket from './socket';

/* Transformers */

export const transformCard = (card) => ({
  ...card,
  deadline: card.deadline && new Date(card.deadline),
  timer: card.timer && {
    ...card.timer,
    startedAt: card.timer.startedAt && new Date(card.timer.startedAt),
  },
});

export const transformCardData = (data) => ({
  ...data,
  ...(data.deadline && {
    deadline: data.deadline.toISOString(),
  }),
  ...(data.timer && {
    ...data.timer,
    ...(data.timer.startedAt && {
      startedAt: data.timer.startedAt.toISOString(),
    }),
  }),
});

/* Actions */

const createCard = (listId, data, headers) => socket.post(`/lists/${listId}/cards`, transformCardData(data), headers).then((body) => ({
  ...body,
  item: transformCard(body.item),
}));

const getCard = (id, headers) => socket.get(`/cards/${id}`, undefined, headers).then((body) => ({
  ...body,
  item: transformCard(body.item),
}));

const updateCard = (id, data, headers) => socket.patch(`/cards/${id}`, transformCardData(data), headers).then((body) => ({
  ...body,
  item: transformCard(body.item),
}));

const deleteCard = (id, headers) => socket.delete(`/cards/${id}`, undefined, headers).then((body) => ({
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
  makeHandleCardCreate,
  makeHandleCardUpdate,
  makeHandleCardDelete,
};
