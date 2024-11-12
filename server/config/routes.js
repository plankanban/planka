const serveStatic = require('serve-static');
const sails = require('sails');
const path = require('path');

// Remove prefix from urlPath, assuming completely matches a subpath of
// urlPath. The result preserves query params and fragment if present
//
// Examples:
// '/foo', '/foo/bar'     -> '/bar'
// '/foo', '/foo'         -> '/'
// '/foo', '/foo?baz=bux' -> '/?baz=bux'
// '/foo', '/foobar'      -> '/foobar'
function removeRoutePrefix(prefix, urlPath) {
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
}

function staticDirServer(prefix, dirFn) {
  return function handleReq(req, res, next) {
    // Custom config properties are not available when the routes config is
    // loaded, so resolve the target value just before serving the request.
    const dir = dirFn();
    const staticServer = serveStatic(dir, { index: false });

    const reqPath = req.url;
    if (reqPath.startsWith(prefix)) {
      // serve-static treats the request url as a sub-path of
      // static root; remove the leading route prefix so the static root
      // doesn't have to include the prefix as a subdirectory.
      req.url = removeRoutePrefix(prefix, req.url);
      return staticServer(req, res, next);
    }
    return next();
  };
}

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
  'GET /api/config': 'show-config',

  'POST /api/access-tokens': 'access-tokens/create',
  'POST /api/access-tokens/exchange-using-oidc': 'access-tokens/exchange-using-oidc',
  'DELETE /api/access-tokens/me': 'access-tokens/delete',

  'GET /api/users': 'users/index',
  'POST /api/users': 'users/create',
  'GET /api/users/:id': 'users/show',
  'PATCH /api/users/:id': 'users/update',
  'PATCH /api/users/:id/email': 'users/update-email',
  'PATCH /api/users/:id/password': 'users/update-password',
  'PATCH /api/users/:id/username': 'users/update-username',
  'POST /api/users/:id/avatar': 'users/update-avatar',
  'DELETE /api/users/:id': 'users/delete',

  'GET /api/projects': 'projects/index',
  'POST /api/projects': 'projects/create',
  'GET /api/projects/:id': 'projects/show',
  'PATCH /api/projects/:id': 'projects/update',
  'POST /api/projects/:id/background-image': 'projects/update-background-image',
  'DELETE /api/projects/:id': 'projects/delete',

  'POST /api/projects/:projectId/managers': 'project-managers/create',
  'DELETE /api/project-managers/:id': 'project-managers/delete',

  'POST /api/projects/:projectId/boards': 'boards/create',
  'GET /api/boards/:id': 'boards/show',
  'PATCH /api/boards/:id': 'boards/update',
  'DELETE /api/boards/:id': 'boards/delete',

  'POST /api/boards/:boardId/memberships': 'board-memberships/create',
  'PATCH /api/board-memberships/:id': 'board-memberships/update',
  'DELETE /api/board-memberships/:id': 'board-memberships/delete',

  'POST /api/boards/:boardId/labels': 'labels/create',
  'PATCH /api/labels/:id': 'labels/update',
  'DELETE /api/labels/:id': 'labels/delete',

  'POST /api/boards/:boardId/lists': 'lists/create',
  'PATCH /api/lists/:id': 'lists/update',
  'POST /api/lists/:id/sort': 'lists/sort',
  'DELETE /api/lists/:id': 'lists/delete',

  'POST /api/lists/:listId/cards': 'cards/create',
  'GET /api/cards/:id': 'cards/show',
  'PATCH /api/cards/:id': 'cards/update',
  'POST /api/cards/:id/duplicate': 'cards/duplicate',
  'DELETE /api/cards/:id': 'cards/delete',
  'POST /api/cards/:cardId/memberships': 'card-memberships/create',
  'DELETE /api/cards/:cardId/memberships': 'card-memberships/delete',
  'POST /api/cards/:cardId/labels': 'card-labels/create',
  'DELETE /api/cards/:cardId/labels/:labelId': 'card-labels/delete',

  'POST /api/cards/:cardId/tasks': 'tasks/create',
  'PATCH /api/tasks/:id': 'tasks/update',
  'DELETE /api/tasks/:id': 'tasks/delete',

  'POST /api/cards/:cardId/attachments': 'attachments/create',
  'PATCH /api/attachments/:id': 'attachments/update',
  'DELETE /api/attachments/:id': 'attachments/delete',

  'GET /api/cards/:cardId/actions': 'actions/index',

  'POST /api/cards/:cardId/comment-actions': 'comment-actions/create',
  'PATCH /api/comment-actions/:id': 'comment-actions/update',
  'DELETE /api/comment-actions/:id': 'comment-actions/delete',

  'GET /api/notifications': 'notifications/index',
  'GET /api/notifications/:id': 'notifications/show',
  'PATCH /api/notifications/:ids': 'notifications/update',

  'GET /user-avatars/*': {
    fn: staticDirServer('/user-avatars', () =>
      path.join(
        path.resolve(sails.config.custom.uploadsBasePath),
        sails.config.custom.userAvatarsPathSegment,
      ),
    ),
    skipAssets: false,
  },

  'GET /project-background-images/*': {
    fn: staticDirServer('/project-background-images', () =>
      path.join(
        path.resolve(sails.config.custom.uploadsBasePath),
        sails.config.custom.projectBackgroundImagesPathSegment,
      ),
    ),
    skipAssets: false,
  },

  'GET /attachments/:id/download/:filename': {
    action: 'attachments/download',
    skipAssets: false,
  },

  'GET /attachments/:id/download/thumbnails/cover-256.:extension': {
    action: 'attachments/download-thumbnail',
    skipAssets: false,
  },

  'GET /*': {
    view: 'index',
    skipAssets: true,
  },
};
