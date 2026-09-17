/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// The running app (sails-postgresql) and the `db:` scripts (knex) each build their
// own connection out of DATABASE_URL, with different parsers and, until now,
// different environment variables. Everything read out of the environment for a
// database connection is resolved here, once, so the two cannot drift apart again
// and an operator only ever has one place to configure.

const fs = require('fs');

// node-postgres sits underneath both connections, so let it be the one that turns
// sslmode, sslrootcert and PGSSLMODE into TLS options: anything we worked out
// ourselves would be a second opinion that eventually disagrees with it.
const ConnectionParameters = require('pg/lib/connection-parameters');

// The literal text an operator writes into DATABASE_URL, not a template string
// eslint-disable-next-line no-template-curly-in-string
const PASSWORD_PLACEHOLDER = '${DATABASE_PASSWORD}';

const SUPPORTED_PROTOCOLS = ['postgres:', 'postgresql:'];

// The connection string parameters node-postgres reads TLS settings from
const SSL_PARAMETER_NAMES = ['ssl', 'sslmode', 'sslrootcert', 'sslcert', 'sslkey'];

const SEARCH_PATH_PATTERN = /^[A-Za-z0-9_$]+(?:,[A-Za-z0-9_$]+)*$/;

const ENCODING_HINT =
  'Percent-encode the user name and password: / becomes %2F, \\ becomes %5C, : becomes %3A, ? becomes %3F, # becomes %23, % becomes %25.';

// These messages end up in logs, screenshots and issue reports, so never show the
// connection string with its password in it. The string may be the malformed one
// we are complaining about, so this cannot lean on a parser: take everything
// between the scheme and the last "@" ahead of the query as the credentials.
const maskPassword = (value) => {
  const schemeEnd = value.indexOf('://');
  const queryStart = value.search(/[?#]/);
  const separator = (queryStart === -1 ? value : value.slice(0, queryStart)).lastIndexOf('@');

  if (schemeEnd === -1 || separator < schemeEnd) {
    return value;
  }

  const credentials = value.slice(schemeEnd + 3, separator);
  const passwordStart = credentials.indexOf(':');

  if (passwordStart === -1) {
    return value;
  }

  return `${value.slice(0, schemeEnd + 3)}${credentials.slice(0, passwordStart)}:***@${value.slice(separator + 1)}`;
};

// start.sh reads the __FILE variants too, but it exports them into the entrypoint
// only. `docker compose exec`, which is how the documented recovery commands are
// run, starts from the container's declared environment and would see nothing.
const readSecret = (name) => {
  if (process.env[name]) {
    return process.env[name];
  }

  const file = process.env[`${name}__FILE`];

  if (!file) {
    return undefined;
  }

  try {
    // The same first line, carriage returns and newlines stripped, that start.sh reads
    return fs.readFileSync(file, 'utf8').split('\n', 1)[0].replace(/\r/g, '');
  } catch (error) {
    throw new Error(`${name}__FILE is set to "${file}", which could not be read: ${error.message}`);
  }
};

// Only start.sh used to expand the placeholder, so every `db:` script run by hand
// sent the literal text to Postgres as the password
const expandPassword = (value) => {
  if (!value.includes(PASSWORD_PLACEHOLDER)) {
    return value;
  }

  const password = readSecret('DATABASE_PASSWORD');

  if (!password) {
    throw new Error(
      `DATABASE_URL contains the placeholder ${PASSWORD_PLACEHOLDER}, but DATABASE_PASSWORD is empty or not set. Set DATABASE_PASSWORD, or point DATABASE_PASSWORD__FILE at a file that holds the password.`,
    );
  }

  return value.split(PASSWORD_PLACEHOLDER).join(encodeURIComponent(password));
};

const resolveUrl = () => {
  const configured = readSecret('DATABASE_URL');

  if (!configured) {
    throw new Error(
      'DATABASE_URL is not set. PLANKA needs a PostgreSQL connection string, for example postgresql://planka:password@postgres:5432/planka. Set DATABASE_URL, or point DATABASE_URL__FILE at a file that holds it.',
    );
  }

  const value = expandPassword(configured);

  let url;
  try {
    url = new URL(value);
  } catch (error) {
    throw new Error(
      `DATABASE_URL is not a valid connection string: ${maskPassword(value)}. ${ENCODING_HINT}`,
    );
  }

  if (!SUPPORTED_PROTOCOLS.includes(url.protocol)) {
    throw new Error(
      `DATABASE_URL must be a PostgreSQL connection string, but it starts with "${url.protocol}//": ${maskPassword(value)}. Expected "postgresql://" or "postgres://".`,
    );
  }

  const credentials = url.password ? `${url.username}:${url.password}` : url.username;

  if (credentials) {
    const authority = value.slice(value.indexOf('://') + 3);

    // The two parsers in the stack only agree on where the host starts when the
    // credentials are encoded. An unencoded slash or backslash moves the host
    // somewhere the operator never configured, which surfaces as ECONNREFUSED
    // against a name they do not recognise. An unencoded "@" is the one case both
    // read the same way, so it stays accepted.
    const acceptedPrefixes = [`${credentials}@`, `${credentials.replaceAll('%40', '@')}@`];

    if (!acceptedPrefixes.some((prefix) => authority.startsWith(prefix))) {
      throw new Error(
        `DATABASE_URL: the user name or password is not percent-encoded, so the database driver takes the host from the wrong part of ${maskPassword(value)}. ${ENCODING_HINT}`,
      );
    }
  }

  let password;
  try {
    password = decodeURIComponent(url.password);
  } catch (error) {
    throw new Error(
      `DATABASE_URL: the password contains an invalid percent-escape: ${maskPassword(value)}. ${ENCODING_HINT}`,
    );
  }

  // sails-postgresql splits the credentials on every ":" and keeps the second
  // field, so a password holding one reaches Postgres cut short. knex reads the
  // same string correctly, which is why migrations can pass while the app cannot
  // authenticate. Nothing here can repair it, but the operator should not have to
  // find that out from "password authentication failed".
  if (password.includes(':')) {
    // eslint-disable-next-line no-console
    console.warn(
      'DATABASE_URL: the password contains ":", which the app\'s database driver cuts short. Migrations will succeed and the app will fail to authenticate. Use a password without ":".',
    );
  }

  if (!url.pathname.replace(/^\/+/, '')) {
    throw new Error(
      `DATABASE_URL does not name a database: ${maskPassword(value)}. Expected the database name after the host, for example postgresql://planka:password@postgres:5432/planka.`,
    );
  }

  return { value, url };
};

const resolveSsl = (value, url) => {
  // Kept for the installations that already run on it. It used to reach only the
  // migrations, which is how an instance could migrate over TLS and then refuse to
  // lift; it now applies to both connections.
  if (
    !SSL_PARAMETER_NAMES.some((name) => url.searchParams.has(name)) &&
    process.env.KNEX_REJECT_UNAUTHORIZED_SSL_CERTIFICATE === 'false'
  ) {
    return { rejectUnauthorized: false };
  }

  try {
    return new ConnectionParameters({ connectionString: value }).ssl;
  } catch (error) {
    throw new Error(
      `DATABASE_URL: the TLS settings could not be applied: ${error.message}. Check sslmode and the files named by sslrootcert, sslcert and sslkey.`,
    );
  }
};

const resolveSearchPath = () => {
  const value = process.env.DATABASE_SCHEMA;

  if (!value) {
    return undefined;
  }

  if (!SEARCH_PATH_PATTERN.test(value)) {
    throw new Error(
      `DATABASE_SCHEMA must be one or more comma-separated PostgreSQL identifiers, but it is "${value}". Expected for example planka, or planka,public.`,
    );
  }

  return value.split(',');
};

module.exports.resolveDatabaseConfig = () => {
  const { value, url } = resolveUrl();

  return {
    url: value,
    ssl: resolveSsl(value, url),
    searchPath: resolveSearchPath(),
  };
};

// sails-postgresql forwards only a fixed list of settings to node-postgres and the
// search path is not on it, so the app can be pointed at another schema only
// through the environment node-postgres reads for itself.
module.exports.applySearchPathToEnvironment = (searchPath) => {
  if (searchPath && !process.env.PGOPTIONS) {
    process.env.PGOPTIONS = `-c search_path=${searchPath.join(',')}`;
  }
};
