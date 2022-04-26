import socket from './socket';
import { transformAction } from './actions';

/* Actions */

const createCommentAction = (cardId, data) =>
  socket.post(`/cards/${cardId}/comment-actions`, data).then((body) => ({
    ...body,
    item: transformAction(body.item),
  }));

const updateCommentAction = (id, data) =>
  socket.patch(`/comment-actions/${id}`, data).then((body) => ({
    ...body,
    item: transformAction(body.item),
  }));

const deleteCommentAction = (id) =>
  socket.delete(`/comment-actions/${id}`).then((body) => ({
    ...body,
    item: transformAction(body.item),
  }));

export default {
  createCommentAction,
  updateCommentAction,
  deleteCommentAction,
};
