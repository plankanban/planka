import ActionTypes from '../constants/ActionTypes';
import SocketStatuses from '../constants/SocketStatuses';

/* Events */

export const socketDisconnected = () => ({
  type: ActionTypes.SOCKET_STATUS_CHANGED,
  payload: {
    status: SocketStatuses.DISCONNECTED,
  },
});

export const socketReconnected = () => ({
  type: ActionTypes.SOCKET_STATUS_CHANGED,
  payload: {
    status: SocketStatuses.RECONNECTED,
  },
});
