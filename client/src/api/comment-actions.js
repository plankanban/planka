import socket from './socket';
import { transformAction } from './actions';

/* Actions */

const createCommentAction = (cardId, data, headers) =>
  socket.post(`/cards/${cardId}/comment-actions`, data, headers).then((body) => ({
    ...body,
    item: transformAction(body.item),
  }));

const updateCommentAction = (id, data, headers) =>
  socket.patch(`/comment-actions/${id}`, data, headers).then((body) => ({
    ...body,
    item: transformAction(body.item),
  }));

const deleteCommentAction = (id, headers) =>
  socket.delete(`/comment-actions/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformAction(body.item),
  }));

export default {
  createCommentAction,
  updateCommentAction,
  deleteCommentAction,
};
