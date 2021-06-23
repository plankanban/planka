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
    let id;

    try {
      id = sails.helpers.utils.verifyToken(accessToken);
    } catch (error) {
      return null;
    }

    return sails.helpers.users.getOne(id);
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
        '/*': {
          async fn(req, res, next) {
            const { authorization: authorizationHeader } = req.headers;

            if (authorizationHeader && TOKEN_PATTERN.test(authorizationHeader)) {
              const accessToken = authorizationHeader.replace(TOKEN_PATTERN, '');

              req.currentUser = await getUser(accessToken);
            }

            return next();
          },
        },
      },
    },
  };
};
