/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

const path = require('path');
const sails = require('sails');

// Remove prefix from urlPath, assuming completely matches a subpath of
// urlPath. The result preserves query params and fragment if present
//
// Examples:
// '/foo', '/foo/bar'     -> '/bar'
// '/foo', '/foo'         -> '/'
// '/foo', '/foo?baz=bux' -> '/?baz=bux'
// '/foo', '/foobar'      -> '/foobar'
const removeRoutePrefix = (prefix, urlPath) => {
  if (urlPath.startsWith(prefix)) {
    const subpath = urlPath.substring(prefix.length);

    if (subpath.startsWith('/')) {
      // Prefix matched a complete set of path segments, with a valid path
      // remaining.
      return subpath;
    }

    if (subpath.length === 0 || subpath.startsWith('?') || subpath.startsWith('#')) {
      // Prefix matched a complete set of path segments, but there is no path
      // remaining. Add '/'.
      return `/${subpath}`;
    }
  }

  // Either the prefix didn't match at all, or it wasn't a complete path match
  // (e.g. we don't want to treat '/foo' as a prefix of '/foobar'). Leave the
  // path as-is.
  return urlPath;
};

const serveStatic = async (prefix, getPathSegment, req, res) => {
  // Custom config properties are not available when the routes config is
  // loaded, so resolve the target value just before serving the request.
  const pathSegment = getPathSegment();
  // Remove the leading route prefix, since it's already included in path
  // segment.
  const normalizedUrlPath = removeRoutePrefix(prefix, req.url);

  const fileManager = sails.hooks['file-manager'].getInstance();
  const filePathSegment = path.join(pathSegment, normalizedUrlPath);

  let readStream;
  let headers;

  try {
    [readStream, headers] = await fileManager.read(filePathSegment, {
      withHeaders: true,
    });
  } catch (err) {
    return res.sendStatus(404);
  }

  res.set({
    ...headers,
    'Cache-Control': `private, max-age=${sails.config.http.cache}, immutable`,
  });

  readStream.on('error', () => {
    if (res.headersSent) {
      res.destroy();
    } else {
      res.sendStatus(404);
    }
  });

  return readStream.pipe(res);
};

/* const publicStaticDirServer = (prefix, getPathSegment) => (req, res, next) => {
  if (!req.url.startsWith(prefix)) {
    return next();
  }

  return serveStatic(prefix, getPathSegment, req, res);
}; */

const protectedStaticDirServer = (prefix, getPathSegment) => (req, res, next) => {
  if (!req.url.startsWith(prefix)) {
    return next();
  }

  try {
    sails.helpers.utils.verifyJwtToken(req.cookies.accessToken);
  } catch (error) {
    return res.sendStatus(401);
  }

  return serveStatic(prefix, getPathSegment, req, res);
};

module.exports.routes = {
  'GET /api/bootstrap': 'bootstrap/show',

  'GET /api/terms/:type': 'terms/show',

  'GET /api/config': 'config/show',
  'PATCH /api/config': 'config/update',
  'POST /api/config/test-smtp': 'config/test-smtp',

  'GET /api/webhooks': 'webhooks/index',
  'POST /api/webhooks': 'webhooks/create',
  'PATCH /api/webhooks/:id': 'webhooks/update',
  'DELETE /api/webhooks/:id': 'webhooks/delete',

  'POST /api/access-tokens': 'access-tokens/create',
  'POST /api/access-tokens/exchange-with-oidc': 'access-tokens/exchange-with-oidc',
  'POST /api/access-tokens/debug-oidc': 'access-tokens/debug-oidc',
  'POST /api/access-tokens/accept-terms': 'access-tokens/accept-terms',
  'POST /api/access-tokens/revoke-pending-token': 'access-tokens/revoke-pending-token',
  'DELETE /api/access-tokens/me': 'access-tokens/delete',

  'GET /api/users': 'users/index',
  'POST /api/users': 'users/create',
  'GET /api/users/:id': 'users/show',
  'PATCH /api/users/:id': 'users/update',
  'PATCH /api/users/:id/email': 'users/update-email',
  'PATCH /api/users/:id/password': 'users/update-password',
  'PATCH /api/users/:id/username': 'users/update-username',
  'POST /api/users/:id/avatar': 'users/update-avatar',
  'POST /api/users/:id/api-key': 'users/create-api-key',
  'DELETE /api/users/:id': 'users/delete',

  'GET /api/projects': 'projects/index',
  'POST /api/projects': 'projects/create',
  'GET /api/projects/:id': 'projects/show',
  'PATCH /api/projects/:id': 'projects/update',
  'DELETE /api/projects/:id': 'projects/delete',

  'POST /api/projects/:projectId/project-managers': 'project-managers/create',
  'DELETE /api/project-managers/:id': 'project-managers/delete',

  'POST /api/projects/:projectId/background-images': 'background-images/create',
  'DELETE /api/background-images/:id': 'background-images/delete',

  'POST /api/projects/:projectId/base-custom-field-groups': 'base-custom-field-groups/create',
  'PATCH /api/base-custom-field-groups/:id': 'base-custom-field-groups/update',
  'DELETE /api/base-custom-field-groups/:id': 'base-custom-field-groups/delete',

  'POST /api/projects/:projectId/boards': 'boards/create',
  'GET /api/boards/:id': 'boards/show',
  'PATCH /api/boards/:id': 'boards/update',
  'DELETE /api/boards/:id': 'boards/delete',

  'POST /api/boards/:boardId/board-memberships': 'board-memberships/create',
  'PATCH /api/board-memberships/:id': 'board-memberships/update',
  'DELETE /api/board-memberships/:id': 'board-memberships/delete',

  'POST /api/boards/:boardId/labels': 'labels/create',
  'PATCH /api/labels/:id': 'labels/update',
  'DELETE /api/labels/:id': 'labels/delete',

  'POST /api/boards/:boardId/lists': 'lists/create',
  'GET /api/lists/:id': 'lists/show',
  'PATCH /api/lists/:id': 'lists/update',
  'POST /api/lists/:id/sort': 'lists/sort',
  'POST /api/lists/:id/move-cards': 'lists/move-cards',
  'POST /api/lists/:id/clear': 'lists/clear',
  'DELETE /api/lists/:id': 'lists/delete',

  'GET /api/lists/:listId/cards': 'cards/index',
  'POST /api/lists/:listId/cards': 'cards/create',
  'GET /api/cards/:id': 'cards/show',
  'PATCH /api/cards/:id': 'cards/update',
  'POST /api/cards/:id/duplicate': 'cards/duplicate',
  'POST /api/cards/:id/read-notifications': 'cards/read-notifications',
  'DELETE /api/cards/:id': 'cards/delete',
  'POST /api/cards/:cardId/card-memberships': 'card-memberships/create',
  'DELETE /api/cards/:cardId/card-memberships/userId::userId': 'card-memberships/delete',
  'POST /api/cards/:cardId/card-labels': 'card-labels/create',
  'DELETE /api/cards/:cardId/card-labels/labelId::labelId': 'card-labels/delete',

  'POST /api/cards/:cardId/task-lists': 'task-lists/create',
  'GET /api/task-lists/:id': 'task-lists/show',
  'PATCH /api/task-lists/:id': 'task-lists/update',
  'DELETE /api/task-lists/:id': 'task-lists/delete',

  'POST /api/task-lists/:taskListId/tasks': 'tasks/create',
  'PATCH /api/tasks/:id': 'tasks/update',
  'DELETE /api/tasks/:id': 'tasks/delete',

  'POST /api/cards/:cardId/attachments': 'attachments/create',
  'PATCH /api/attachments/:id': 'attachments/update',
  'DELETE /api/attachments/:id': 'attachments/delete',

  'POST /api/boards/:boardId/custom-field-groups': 'custom-field-groups/create-in-board',
  'POST /api/cards/:cardId/custom-field-groups': 'custom-field-groups/create-in-card',
  'GET /api/custom-field-groups/:id': 'custom-field-groups/show',
  'PATCH /api/custom-field-groups/:id': 'custom-field-groups/update',
  'DELETE /api/custom-field-groups/:id': 'custom-field-groups/delete',

  'POST /api/base-custom-field-groups/:baseCustomFieldGroupId/custom-fields':
    'custom-fields/create-in-base-custom-field-group',
  'POST /api/custom-field-groups/:customFieldGroupId/custom-fields':
    'custom-fields/create-in-custom-field-group',
  'PATCH /api/custom-fields/:id': 'custom-fields/update',
  'DELETE /api/custom-fields/:id': 'custom-fields/delete',

  'PATCH /api/cards/:cardId/custom-field-values/customFieldGroupId::customFieldGroupId[:]customFieldId::customFieldId':
    'custom-field-values/create-or-update',
  'DELETE /api/cards/:cardId/custom-field-values/customFieldGroupId::customFieldGroupId[:]customFieldId::customFieldId':
    'custom-field-values/delete',

  'GET /api/cards/:cardId/comments': 'comments/index',
  'POST /api/cards/:cardId/comments': 'comments/create',
  'PATCH /api/comments/:id': 'comments/update',
  'DELETE /api/comments/:id': 'comments/delete',

  'GET /api/boards/:boardId/actions': 'actions/index-in-board',
  'GET /api/cards/:cardId/actions': 'actions/index-in-card',

  'GET /api/notifications': 'notifications/index',
  'GET /api/notifications/:id': 'notifications/show',
  'PATCH /api/notifications/:id': 'notifications/update',
  'POST /api/notifications/read-all': 'notifications/read-all',

  'POST /api/users/:userId/notification-services': 'notification-services/create-in-user',
  'POST /api/boards/:boardId/notification-services': 'notification-services/create-in-board',
  'PATCH /api/notification-services/:id': 'notification-services/update',
  'POST /api/notification-services/:id/test': 'notification-services/test',
  'DELETE /api/notification-services/:id': 'notification-services/delete',

  'PATCH /api/_internal/config': '_internal/update-config',

  'GET /favicons/*': {
    fn: protectedStaticDirServer('/favicons', () => sails.config.custom.faviconsPathSegment),
    skipAssets: false,
  },

  'GET /user-avatars/*': {
    fn: protectedStaticDirServer('/user-avatars', () => sails.config.custom.userAvatarsPathSegment),
    skipAssets: false,
  },

  'GET /background-images/*': {
    fn: protectedStaticDirServer(
      '/background-images',
      () => sails.config.custom.backgroundImagesPathSegment,
    ),
    skipAssets: false,
  },

  'GET /attachments/:id/download/:filename': {
    action: 'file-attachments/download',
    skipAssets: false,
  },

  'GET r|^/attachments/(\\w+)/download/thumbnails/([\\w-]+).(\\w+)$|id,fileName,fileExtension': {
    action: 'file-attachments/download-thumbnail',
    skipAssets: false,
  },

  'GET /*': {
    view: 'index',
    skipAssets: true,
  },
};
