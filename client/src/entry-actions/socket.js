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
