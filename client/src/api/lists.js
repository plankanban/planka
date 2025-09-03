/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import omit from 'lodash/omit';

import socket from './socket';
import { transformCard } from './cards';
import { transformAttachment } from './attachments';
import { transformActivity } from './activities';

/* Actions */

const createList = (boardId, data, headers) =>
  socket.post(`/boards/${boardId}/lists`, data, headers);

const getList = (id, headers) =>
  socket.get(`/lists/${id}`, undefined, headers).then((body) => ({
    ...body,
    included: {
      ...body.included,
      cards: body.included.cards.map(transformCard),
      attachments: body.included.attachments.map(transformAttachment),
    },
  }));

const updateList = (id, data, headers) => socket.patch(`/lists/${id}`, data, headers);

const sortList = (id, data, headers) =>
  socket.post(`/lists/${id}/sort`, data, headers).then((body) => ({
    ...body,
    included: {
      ...body.included,
      cards: body.included.cards.map(transformCard),
    },
  }));

const moveListCards = (id, data, headers) =>
  socket.post(`/lists/${id}/move-cards`, data, headers).then((body) => ({
    ...body,
    included: {
      ...omit(body.included, 'actions'),
      cards: body.included.cards.map(transformCard),
      activities: body.included.actions.map(transformActivity),
    },
  }));

const clearList = (id, headers) => socket.post(`/lists/${id}/clear`, undefined, headers);

const deleteList = (id, headers) =>
  socket.delete(`/lists/${id}`, undefined, headers).then((body) => ({
    ...body,
    included: {
      ...body.included,
      cards: body.included.cards.map(transformCard),
    },
  }));

/* Event handlers */

const makeHandleListDelete = (next) => (body) => {
  next({
    ...body,
    included: {
      ...body.included,
      cards: body.included.cards.map(transformCard),
    },
  });
};

export default {
  createList,
  getList,
  updateList,
  sortList,
  moveListCards,
  clearList,
  deleteList,
  makeHandleListDelete,
};
