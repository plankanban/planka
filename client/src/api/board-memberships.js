import socket from './socket';

/* Transformers */

export const transformBoardMembership = (boardMembership) => ({
  ...boardMembership,
  createdAt: new Date(boardMembership.createdAt),
});

/* Actions */

const createBoardMembership = (boardId, data, headers) =>
  socket.post(`/boards/${boardId}/memberships`, data, headers).then((body) => ({
    ...body,
    item: transformBoardMembership(body.item),
  }));

const updateBoardMembership = (id, data, headers) =>
  socket.patch(`/board-memberships/${id}`, data, headers).then((body) => ({
    ...body,
    item: transformBoardMembership(body.item),
  }));

const deleteBoardMembership = (id, headers) =>
  socket.delete(`/board-memberships/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformBoardMembership(body.item),
  }));

/* Event handlers */

const makeHandleBoardMembershipCreate = (next) => (body) => {
  next({
    ...body,
    item: transformBoardMembership(body.item),
  });
};

const makeHandleBoardMembershipUpdate = makeHandleBoardMembershipCreate;

const makeHandleBoardMembershipDelete = makeHandleBoardMembershipCreate;

export default {
  createBoardMembership,
  updateBoardMembership,
  deleteBoardMembership,
  makeHandleBoardMembershipCreate,
  makeHandleBoardMembershipUpdate,
  makeHandleBoardMembershipDelete,
};
