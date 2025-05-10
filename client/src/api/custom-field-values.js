/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const updateCustomFieldValue = (cardId, customFieldGroupId, customFieldId, data, headers) =>
  socket.patch(
    `/cards/${cardId}/custom-field-values/customFieldGroupId:${customFieldGroupId}:customFieldId:${customFieldId}`,
    data,
    headers,
  );

const deleteCustomFieldValue = (cardId, customFieldGroupId, customFieldId, headers) =>
  socket.delete(
    `/cards/${cardId}/custom-field-values/customFieldGroupId:${customFieldGroupId}:customFieldId:${customFieldId}`,
    undefined,
    headers,
  );

export default {
  updateCustomFieldValue,
  deleteCustomFieldValue,
};
