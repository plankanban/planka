import socket from './socket';

/* Actions */

const createCardLabel = (cardId, data, headers) =>
  socket.post(`/cards/${cardId}/labels`, data, headers);

const deleteCardLabel = (cardId, labelId, headers) =>
  socket.delete(`/cards/${cardId}/labels/${labelId}`, undefined, headers);

export default {
  createCardLabel,
  deleteCardLabel,
};
