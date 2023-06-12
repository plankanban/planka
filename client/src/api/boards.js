import socket from './socket';
import http from './http';
import { transformUser } from './users';
import { transformBoardMembership } from './board-memberships';
import { transformCard } from './cards';
import { transformAttachment } from './attachments';

/* Actions */

const createBoard = (projectId, data, headers) =>
  socket.post(`/projects/${projectId}/boards`, data, headers).then((body) => ({
    ...body,
    included: {
      ...body.included,
      boardMemberships: body.included.boardMemberships.map(transformBoardMembership),
    },
  }));

const createBoardWithImport = (projectId, data, requestId, headers) =>
  http.post(`/projects/${projectId}/boards?requestId=${requestId}`, data, headers);

const getBoard = (id, subscribe, headers) =>
  socket
    .get(`/boards/${id}${subscribe ? '?subscribe=true' : ''}`, undefined, headers)
    .then((body) => ({
      ...body,
      included: {
        ...body.included,
        users: body.included.users.map(transformUser),
        boardMemberships: body.included.boardMemberships.map(transformBoardMembership),
        cards: body.included.cards.map(transformCard),
        attachments: body.included.attachments.map(transformAttachment),
      },
    }));

const updateBoard = (id, data, headers) => socket.patch(`/boards/${id}`, data, headers);

const deleteBoard = (id, headers) => socket.delete(`/boards/${id}`, undefined, headers);

export default {
  createBoard,
  createBoardWithImport,
  getBoard,
  updateBoard,
  deleteBoard,
};
