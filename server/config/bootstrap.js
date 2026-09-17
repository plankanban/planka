/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 */

// The value our own example compose file ships. Anyone who copied that file
// and never read the paragraph next to it is running with a signing key that
// is published in our documentation — which means anyone can mint a token for
// any account on their instance.
const EXAMPLE_SECRET_KEY = 'notsecretkey';

// What the documentation asks for, and what `openssl rand -hex 32` produces.
const MIN_SECRET_KEY_LENGTH = 32;

// The endpoint is public and `Origin` is whatever the caller chose to send, so
// the set of origins remembered below is somewhere an unbounded amount of junk
// could be put. Ten is far more distinct wrong addresses than a misconfigured
// instance has; past that there is nothing further to learn from the eleventh.
const MAX_REPORTED_ORIGINS = 10;

const RULE = '─'.repeat(72);

const banner = (label, headline, detail) => {
  sails.log.warn(RULE);
  sails.log.warn(`${label}: ${headline}`);
  detail.forEach((line) => sails.log.warn(`  ${line}`));
  sails.log.warn(RULE);
};

// Loud on purpose. This is not a misconfiguration that degrades a feature; it
// is the difference between sessions that can be forged and sessions that
// cannot, and it is invisible from inside a working instance.
const warn = (headline, detail) => banner('SECURITY', headline, detail);

const checkSecretKey = () => {
  const secretKey = sails.config.session.secret;

  if (!secretKey) {
    warn('SECRET_KEY is not set.', [
      'Every access token is signed with it. Without one, sessions cannot be',
      'trusted. Generate a key with:  openssl rand -hex 32',
    ]);

    return;
  }

  if (secretKey === EXAMPLE_SECRET_KEY) {
    warn('SECRET_KEY is still the value from the example configuration.', [
      'It is published in our documentation, so anyone can sign a token for any',
      'account on this instance. Replace it now:  openssl rand -hex 32',
      '',
      'Changing it invalidates every token already issued — everyone signs in',
      'again once, and that is the whole cost.',
    ]);

    return;
  }

  if (secretKey.length < MIN_SECRET_KEY_LENGTH) {
    warn(`SECRET_KEY is shorter than ${MIN_SECRET_KEY_LENGTH} characters.`, [
      `It is ${secretKey.length}. A short key is a guessable key, and guessing it`,
      'means forging sessions. Generate a proper one:  openssl rand -hex 32',
    ]);
  }
};

// config/env/production.js puts the expected half of the comparison on the
// record at startup. This is the other half: the address that was actually
// used, at the moment it is turned away.
//
// sails-hook-sockets does report the refusal, but at `verbose` and naming only
// the origin it rejected — never the list it compared against, which is the
// half that shows where the mismatch is.
//
// `onlyAllowOrigins` reaches Socket.io as a CORS origin check and Socket.io
// hands that to engine.io as a middleware; a middleware that calls back with an
// error is turned into a `connection_error` carrying the request, for the
// polling handshake and for the websocket upgrade alike. Since that CORS check
// is the only middleware engine.io is given here, `MIDDLEWARE_FAILURE` means a
// refused origin and cannot mean anything else. (Checked against the installed
// engine.io 6.6.9, server.js:545 and :582.)
const reportRefusedSocketOrigins = () => {
  const allowedOrigins = sails.config.sockets && sails.config.sockets.onlyAllowOrigins;

  // Unset outside production, where nothing is refused and the reasoning above
  // about what `MIDDLEWARE_FAILURE` means would no longer hold.
  if (!sails.io || !sails.io.engine || !Array.isArray(allowedOrigins)) {
    return;
  }

  // A refused client reconnects, and goes on reconnecting every few seconds for
  // as long as the tab is open. What the operator needs is the list of
  // addresses people are reaching this instance at, and each of those is worth
  // exactly one reading; the repeats only bury it.
  const reportedOrigins = new Set();

  sails.io.engine.on('connection_error', (error) => {
    if (!error.context || error.context.name !== 'MIDDLEWARE_FAILURE') {
      return;
    }

    // Missing for anything that is not a browser, and refused for the same
    // reason a wrong one is: `undefined` is not in the list either.
    const origin = (error.req && error.req.headers && error.req.headers.origin) || '';

    if (reportedOrigins.has(origin) || reportedOrigins.size >= MAX_REPORTED_ORIGINS) {
      return;
    }

    reportedOrigins.add(origin);

    const refused = origin ? `from ${origin}` : 'with no Origin header';

    banner(
      'CONFIGURATION',
      `A socket connection ${refused} was refused; ` +
        `the allowed origins are ${allowedOrigins.join(', ')}.`,
      [
        'The two have to match exactly, scheme and port included. Both sides of',
        'this comparison are built from BASE_URL, so that is the one thing to',
        'change — set it to the address the browser actually uses and restart.',
        '',
        'It takes a comma-separated list where an instance is reached at more',
        'than one address.',
        '',
        'Until then a browser at that address loads the page and then never sees',
        'a board change by itself: only the socket is refused, not the page.',
      ],
    );

    if (reportedOrigins.size === MAX_REPORTED_ORIGINS) {
      sails.log.warn(
        `CONFIGURATION: ${MAX_REPORTED_ORIGINS} different origins have now been refused. ` +
          'Further refusals will not be reported until PLANKA is restarted.',
      );
    }
  });
};

module.exports.bootstrap = async () => {
  checkSecretKey();
  reportRefusedSocketOrigins();
};
