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
  'POST /api/access-tokens': 'access-tokens/create',

  'GET /api/users': 'users/index',
  'POST /api/users': 'users/create',
  'GET /api/users/me': 'users/show',
  'PATCH /api/users/:id': 'users/update',
  'POST /api/users/:id/upload-avatar': 'users/upload-avatar',
  'DELETE /api/users/:id': 'users/delete',

  'GET /api/projects': 'projects/index',
  'POST /api/projects': 'projects/create',
  'PATCH /api/projects/:id': 'projects/update',
  'DELETE /api/projects/:id': 'projects/delete',

  'POST /api/projects/:projectId/memberships': 'project-memberships/create',
  'DELETE /api/project-memberships/:id': 'project-memberships/delete',

  'POST /api/projects/:projectId/boards': 'boards/create',
  'GET /api/boards/:id': 'boards/show',
  'PATCH /api/boards/:id': 'boards/update',
  'DELETE /api/boards/:id': 'boards/delete',

  'POST /api/boards/:boardId/lists': 'lists/create',
  'PATCH /api/lists/:id': 'lists/update',
  'DELETE /api/lists/:id': 'lists/delete',

  'POST /api/boards/:boardId/labels': 'labels/create',
  'PATCH /api/labels/:id': 'labels/update',
  'DELETE /api/labels/:id': 'labels/delete',

  'POST /api/lists/:listId/cards': 'cards/create',
  'GET /api/cards/:id': 'cards/show',
  'PATCH /api/cards/:id': 'cards/update',
  'DELETE /api/cards/:id': 'cards/delete',
  'POST /api/cards/:cardId/memberships': 'card-memberships/create',
  'DELETE /api/cards/:cardId/memberships': 'card-memberships/delete',
  'POST /api/cards/:cardId/labels': 'card-labels/create',
  'DELETE /api/cards/:cardId/labels/:labelId': 'card-labels/delete',

  'POST /api/cards/:cardId/tasks': 'tasks/create',
  'PATCH /api/tasks/:id': 'tasks/update',
  'DELETE /api/tasks/:id': 'tasks/delete',

  'GET /api/cards/:cardId/actions': 'actions/index',

  'POST /api/cards/:cardId/comment-actions': 'comment-actions/create',
  'PATCH /api/comment-actions/:id': 'comment-actions/update',
  'DELETE /api/comment-actions/:id': 'comment-actions/delete',

  'GET /api/notifications': 'notifications/index',
  'PATCH /api/notifications/:ids': 'notifications/update',

  'GET /*': {
    view: 'index',
    skipAssets: true,
  },
};
