/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  'POST /access-tokens': 'access-tokens/create',

  'GET /users': 'users/index',
  'POST /users': 'users/create',
  'GET /users/me': 'users/show',
  'PATCH /users/:id': 'users/update',
  'POST /users/:id/upload-avatar': 'users/upload-avatar',
  'DELETE /users/:id': 'users/delete',

  'GET /projects': 'projects/index',
  'POST /projects': 'projects/create',
  'PATCH /projects/:id': 'projects/update',
  'DELETE /projects/:id': 'projects/delete',

  'POST /projects/:projectId/memberships': 'project-memberships/create',
  'DELETE /project-memberships/:id': 'project-memberships/delete',

  'POST /projects/:projectId/boards': 'boards/create',
  'GET /boards/:id': 'boards/show',
  'PATCH /boards/:id': 'boards/update',
  'DELETE /boards/:id': 'boards/delete',

  'POST /boards/:boardId/lists': 'lists/create',
  'PATCH /lists/:id': 'lists/update',
  'DELETE /lists/:id': 'lists/delete',

  'POST /boards/:boardId/labels': 'labels/create',
  'PATCH /labels/:id': 'labels/update',
  'DELETE /labels/:id': 'labels/delete',

  'POST /lists/:listId/cards': 'cards/create',
  'GET /cards/:id': 'cards/show',
  'PATCH /cards/:id': 'cards/update',
  'DELETE /cards/:id': 'cards/delete',
  'POST /cards/:cardId/memberships': 'card-memberships/create',
  'DELETE /cards/:cardId/memberships': 'card-memberships/delete',
  'POST /cards/:cardId/labels': 'card-labels/create',
  'DELETE /cards/:cardId/labels/:labelId': 'card-labels/delete',

  'POST /cards/:cardId/tasks': 'tasks/create',
  'PATCH /tasks/:id': 'tasks/update',
  'DELETE /tasks/:id': 'tasks/delete',

  'GET /cards/:cardId/actions': 'actions/index',

  'POST /cards/:cardId/comment-actions': 'comment-actions/create',
  'PATCH /comment-actions/:id': 'comment-actions/update',
  'DELETE /comment-actions/:id': 'comment-actions/delete',

  'GET /notifications': 'notifications/index',
  'PATCH /notifications/:ids': 'notifications/update'
};
