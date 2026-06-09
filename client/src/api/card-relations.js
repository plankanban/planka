/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const createCardRelation = (cardId, data, headers) =>
  socket.post(`/cards/${cardId}/card-relations`, data, headers);

const deleteCardRelation = (cardId, id, headers) =>
  socket.delete(`/cards/${cardId}/card-relations/${id}`, undefined, headers);

export default {
  createCardRelation,
  deleteCardRelation,
};
