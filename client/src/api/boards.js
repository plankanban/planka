import socket from './socket';
import http from './http';
import { transformCard } from './cards';
import { transformAttachment } from './attachments';

/* Actions */

const createBoard = (projectId, data, headers) =>
  socket.post(`/projects/${projectId}/boards`, data, headers);

// TODO: remove and use createBoard instead
const importBoard = (projectId, data, headers) =>
  http.post(
    `/projects/${projectId}/imports/boards?name=${data.name}&position=${data.position}`,
    {
      file: data.import.file,
    },
    headers,
  );

const getBoard = (id, headers) =>
  socket.get(`/boards/${id}`, undefined, headers).then((body) => ({
    ...body,
    included: {
      ...body.included,
      cards: body.included.cards.map(transformCard),
      attachments: body.included.attachments.map(transformAttachment),
    },
  }));

const updateBoard = (id, data, headers) => socket.patch(`/boards/${id}`, data, headers);

const deleteBoard = (id, headers) => socket.delete(`/boards/${id}`, undefined, headers);

export default {
  createBoard,
  importBoard,
  getBoard,
  updateBoard,
  deleteBoard,
};
