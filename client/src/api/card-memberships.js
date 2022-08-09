import socket from './socket';

/* Actions */

const createCardMembership = (cardId, data, headers) =>
  socket.post(`/cards/${cardId}/memberships`, data, headers);

const deleteCardMembership = (cardId, userId, headers) =>
  socket.delete(`/cards/${cardId}/memberships?userId=${userId}`, undefined, headers);

export default {
  createCardMembership,
  deleteCardMembership,
};
