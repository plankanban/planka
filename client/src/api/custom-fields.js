/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const createCustomFieldInBaseGroup = (baseCustomFieldGroupId, data, headers) =>
  socket.post(`/base-custom-field-groups/${baseCustomFieldGroupId}/custom-fields`, data, headers);

const createCustomFieldInGroup = (customFieldGroupId, data, headers) =>
  socket.post(`/custom-field-groups/${customFieldGroupId}/custom-fields`, data, headers);

const updateCustomField = (id, data, headers) =>
  socket.patch(`/custom-fields/${id}`, data, headers);

const deleteCustomField = (id, headers) =>
  socket.delete(`/custom-fields/${id}`, undefined, headers);

export default {
  createCustomFieldInBaseGroup,
  createCustomFieldInGroup,
  updateCustomField,
  deleteCustomField,
};
