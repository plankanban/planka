/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const handleSocketDisconnect = () => ({
  type: EntryActionTypes.SOCKET_DISCONNECT_HANDLE,
  payload: {},
});

const handleSocketReconnect = () => ({
  type: EntryActionTypes.SOCKET_RECONNECT_HANDLE,
  payload: {},
});

export default {
  handleSocketDisconnect,
  handleSocketReconnect,
};
