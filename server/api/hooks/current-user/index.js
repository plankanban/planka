/**
 * current-user hook
 *
 * @description :: A hook definition. Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function defineCurrentUserHook(sails) {
  const TOKEN_PATTERN = /^Bearer /;

  const getUser = async accessToken => {
    let id;

    try {
      id = sails.helpers.verifyToken(accessToken);
    } catch (unusedError) {
      return;
    }

    return await sails.helpers.getUser(id);
  };

  return {
    /**
     * Runs when this Sails app loads/lifts.
     */

    initialize: async function() {
      sails.log.info('Initializing custom hook (`current-user`)');
    },

    routes: {
      before: {
        '/*': {
          fn: async function(req, res, next) {
            const { authorization: authorizationHeader } = req.headers;

            if (
              authorizationHeader &&
              TOKEN_PATTERN.test(authorizationHeader)
            ) {
              const accessToken = authorizationHeader.replace(
                TOKEN_PATTERN,
                ''
              );

              req.currentUser = await getUser(accessToken);
            }

            return next();
          }
        }
      }
    }
  };
};
