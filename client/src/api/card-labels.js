import socket from './socket';

/* Actions */

const createCardLabel = (cardId, data) => socket.post(`/cards/${cardId}/labels`, data);

const deleteCardLabel = (cardId, labelId) => socket.delete(`/cards/${cardId}/labels/${labelId}`);

export default {
  createCardLabel,
  deleteCardLabel,
};
