import socket from './socket';
import { transformActivity } from './activities';

/* Actions */

const createCommentActivity = (cardId, data, headers) =>
  socket.post(`/cards/${cardId}/comment-actions`, data, headers).then((body) => ({
    ...body,
    item: transformActivity(body.item),
  }));

const updateCommentActivity = (id, data, headers) =>
  socket.patch(`/comment-actions/${id}`, data, headers).then((body) => ({
    ...body,
    item: transformActivity(body.item),
  }));

const deleteCommentActivity = (id, headers) =>
  socket.delete(`/comment-actions/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformActivity(body.item),
  }));

export default {
  createCommentActivity,
  updateCommentActivity,
  deleteCommentActivity,
};
