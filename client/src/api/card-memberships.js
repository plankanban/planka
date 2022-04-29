import socket from './socket';

/* Actions */

const createCardMembership = (cardId, data) => socket.post(`/cards/${cardId}/memberships`, data);

const deleteCardMembership = (cardId, userId) =>
  socket.delete(`/cards/${cardId}/memberships?userId=${userId}`);

export default {
  createCardMembership,
  deleteCardMembership,
};
