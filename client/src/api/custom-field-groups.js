/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const createBoardCustomFieldGroup = (cardId, data, headers) =>
  socket.post(`/boards/${cardId}/custom-field-groups`, data, headers);

const createCardCustomFieldGroup = (cardId, data, headers) =>
  socket.post(`/cards/${cardId}/custom-field-groups`, data, headers);

const getCustomFieldGroup = (id, headers) =>
  socket.get(`/custom-field-groups/${id}`, undefined, headers);

const updateCustomFieldGroup = (id, data, headers) =>
  socket.patch(`/custom-field-groups/${id}`, data, headers);

const deleteCustomFieldGroup = (id, headers) =>
  socket.delete(`/custom-field-groups/${id}`, undefined, headers);

export default {
  createBoardCustomFieldGroup,
  createCardCustomFieldGroup,
  getCustomFieldGroup,
  updateCustomFieldGroup,
  deleteCustomFieldGroup,
};
