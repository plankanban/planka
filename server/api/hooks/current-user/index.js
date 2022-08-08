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
    let iat;
    let decodedToken;

    try {
      decodedToken = sails.helpers.utils.verifyToken(accessToken);
    } catch (error) {
      return null;
    }

    if (_.isString(decodedToken)) {
      id = decodedToken;
      iat = 1;
    } else {
      id = decodedToken.sub;
      iat = decodedToken.iat;
    }

    return sails.helpers.users.getOne({
      id,
      passwordChangedAt: { '<=': new Date((iat + 1) * 1000) },
    });
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
            let accessToken;
            if (req.headers.authorization) {
              if (TOKEN_PATTERN.test(req.headers.authorization)) {
                accessToken = req.headers.authorization.replace(TOKEN_PATTERN, '');
              }
            } else if (req.cookies.accessToken) {
              accessToken = req.cookies.accessToken;
            }

            if (accessToken) {
              req.currentUser = await getUser(accessToken);
            }

            return next();
          },
        },
      },
    },
  };
};
