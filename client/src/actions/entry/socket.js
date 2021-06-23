import EntryActionTypes from '../../constants/EntryActionTypes';

export const handleSocketDisconnect = () => ({
  type: EntryActionTypes.SOCKET_DISCONNECT_HANDLE,
  payload: {},
});

export const handleSocketReconnect = () => ({
  type: EntryActionTypes.SOCKET_RECONNECT_HANDLE,
  payload: {},
});
