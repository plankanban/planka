const dotenv = require('dotenv');
const sails = require('sails');
const rc = require('sails/accessible/rc');

process.env.NODE_ENV = 'test';

before(function beforeCallback(done) {
  // Lifting against a real Postgres (TEST_DATABASE_URL) is slower than the
  // in-memory sails-disk default, especially on a cold container.
  this.timeout(30000);

  dotenv.config({ quiet: true });

  sails.lift(rc('sails'), (error) => {
    if (error) {
      return done(error);
    }

    return done();
  });
});

after(function afterCallback(done) {
  sails.lower(done);
});
