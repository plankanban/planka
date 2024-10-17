const dotenv = require('dotenv');
const sails = require('sails');
const rc = require('sails/accessible/rc');

process.chdir(__dirname);
dotenv.config();

const config = rc('sails');

const getConfigPromise = new Promise((resolve) => {
  sails.load(
    {
      ...config,
      hooks: {
        ...config.hooks,
        logger: false,
        request: false,
        views: false,
        blueprints: false,
        responses: false,
        helpers: false,
        pubsub: false,
        policies: false,
        services: false,
        security: false,
        i18n: false,
        session: false,
        http: false,
        userhooks: false,
      },
    },
    () => {
      resolve(sails.config);
    },
  );
});

module.exports = () => getConfigPromise;
