/**
 * current-user hook
 *
 * @description :: A hook definition. Extends Sails by adding shadow routes, implicit actions,
 *                 and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function defineCurrentUserHook(sails) {
  const TOKEN_PATTERN = /^Bearer /;

  const getSessionAndUser = async (accessToken, httpOnlyToken) => {
    let payload;
    try {
      payload = sails.helpers.utils.verifyJwtToken(accessToken);
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

    if (session.httpOnlyToken && httpOnlyToken !== session.httpOnlyToken) {
      return null;
    }

    const user = await sails.helpers.users.getOne(payload.subject);

    if (user && user.passwordChangedAt > payload.issuedAt) {
      return null;
    }

    return {
      session,
      user,
    };
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
              const { httpOnlyToken } = req.cookies;

              const sessionAndUser = await getSessionAndUser(accessToken, httpOnlyToken);

              if (sessionAndUser) {
                const { session, user } = sessionAndUser;

                Object.assign(req, {
                  currentSession: session,
                  currentUser: user,
                });

                if (req.isSocket) {
                  sails.sockets.join(req, `@accessToken:${session.accessToken}`);
                  sails.sockets.join(req, `@user:${user.id}`);
                }
              }
            }

            return next();
          },
        },
        '/attachments/*': {
          async fn(req, res, next) {
            const { accessToken, httpOnlyToken } = req.cookies;

            if (accessToken) {
              const sessionAndUser = await getSessionAndUser(accessToken, httpOnlyToken);

              if (sessionAndUser) {
                const { session, user } = sessionAndUser;

                Object.assign(req, {
                  currentSession: session,
                  currentUser: user,
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
