import socket from './socket';
import { transformCard } from './cards';
import { transformAttachment } from './attachments';

/* Actions */

const createBoard = (projectId, data) => socket.post(`/projects/${projectId}/boards`, data);

const getBoard = (id) =>
  socket.get(`/boards/${id}`).then((body) => ({
    ...body,
    included: {
      ...body.included,
      cards: body.included.cards.map(transformCard),
      attachments: body.included.attachments.map(transformAttachment),
    },
  }));

const updateBoard = (id, data) => socket.patch(`/boards/${id}`, data);

const deleteBoard = (id) => socket.delete(`/boards/${id}`);

export default {
  createBoard,
  getBoard,
  updateBoard,
  deleteBoard,
};
