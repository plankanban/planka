const dotenv = require('dotenv');
const sails = require('sails');
const rc = require('sails/accessible/rc');

process.env.NODE_ENV = 'test';

before(function beforeCallback(done) {
  this.timeout(5000);

  dotenv.config();

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
