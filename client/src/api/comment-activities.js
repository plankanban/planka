import socket from './socket';
import { transformActivity } from './activities';

/* Actions */

const createCommentActivity = (cardId, data) =>
  socket.post(`/cards/${cardId}/comment-actions`, data).then((body) => ({
    ...body,
    item: transformActivity(body.item),
  }));

const updateCommentActivity = (id, data) =>
  socket.patch(`/comment-actions/${id}`, data).then((body) => ({
    ...body,
    item: transformActivity(body.item),
  }));

const deleteCommentActivity = (id) =>
  socket.delete(`/comment-actions/${id}`).then((body) => ({
    ...body,
    item: transformActivity(body.item),
  }));

export default {
  createCommentActivity,
  updateCommentActivity,
  deleteCommentActivity,
};
