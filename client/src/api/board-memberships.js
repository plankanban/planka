import socket from './socket';

/* Actions */

const createBoardMembership = (boardId, data, headers) =>
  socket.post(`/boards/${boardId}/memberships`, data, headers);

const updateBoardMembership = (id, data, headers) =>
  socket.patch(`/board-memberships/${id}`, data, headers);

const deleteBoardMembership = (id, headers) =>
  socket.delete(`/board-memberships/${id}`, undefined, headers);

export default {
  createBoardMembership,
  updateBoardMembership,
  deleteBoardMembership,
};
