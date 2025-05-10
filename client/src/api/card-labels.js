/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const createCardLabel = (cardId, data, headers) =>
  socket.post(`/cards/${cardId}/card-labels`, data, headers);

const deleteCardLabel = (cardId, labelId, headers) =>
  socket.delete(`/cards/${cardId}/card-labels/labelId:${labelId}`, undefined, headers);

export default {
  createCardLabel,
  deleteCardLabel,
};
