/**
 * current-user hook
 *
 * @description :: A hook definition. Extends Sails by adding shadow routes, implicit actions,
 *                 and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function defineCurrentUserHook(sails) {
  const TOKEN_PATTERN = /^Bearer /;

  const getUser = async (accessToken) => {
    let payload;
    try {
      payload = sails.helpers.utils.verifyToken(accessToken);
    } catch (error) {
      return null;
    }

    const session = await Session.findOne({
      accessToken,
      deletedAt: null,
    });

    if (!session) {
      return null;
    }

    const user = await sails.helpers.users.getOne(payload.subject);

    if (user && user.passwordChangedAt > payload.issuedAt) {
      return null;
    }

    return user;
  };

  return {
    /**
     * Runs when this Sails app loads/lifts.
     */

    async initialize() {
      sails.log.info('Initializing custom hook (`current-user`)');
    },

    routes: {
      before: {
        '/api/*': {
          async fn(req, res, next) {
            const { authorization: authorizationHeader } = req.headers;

            if (authorizationHeader && TOKEN_PATTERN.test(authorizationHeader)) {
              const accessToken = authorizationHeader.replace(TOKEN_PATTERN, '');
              const currentUser = await getUser(accessToken);

              if (currentUser) {
                Object.assign(req, {
                  accessToken,
                  currentUser,
                });

                if (req.isSocket) {
                  sails.sockets.join(req, `@accessToken:${accessToken}`);
                  sails.sockets.join(req, `@user:${currentUser.id}`);
                }
              }
            }

            return next();
          },
        },
        '/attachments/*': {
          async fn(req, res, next) {
            const { accessToken } = req.cookies;

            if (accessToken) {
              const currentUser = await getUser(accessToken);

              if (currentUser) {
                Object.assign(req, {
                  accessToken,
                  currentUser,
                });
              }
            }

            return next();
          },
        },
      },
    },
  };
};
