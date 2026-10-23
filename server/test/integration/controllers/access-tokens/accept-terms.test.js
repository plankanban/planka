/*
 * Requires a PostgreSQL datastore: the code under test uses native SQL paths that
 * sails-disk (the default in config/env/test.js) does not support. Run with
 * NODE_ENV=test and the datastore overridden, e.g. sails_datastores__default__adapter=sails-postgresql
 * and sails_datastores__default__url=postgresql://user:pass@localhost/db.
 * The suite temporarily toggles the instance-wide isInitialized flag and restores it in `after`.
 */

const { expect } = require('chai');
const request = require('supertest');
const bcrypt = require('bcrypt');
const { authenticator } = require('otplib');

const { AccessTokenSteps, TRUST_DEVICE_COOKIE_NAME } = require('../../../../constants');

const PENDING_TOKEN_EXPIRES_IN = 10 * 60;

describe('POST /api/access-tokens/accept-terms', () => {
  const suffix = Date.now().toString(36);
  const createdUserIds = [];
  let wasInitialized;
  let signature;
  let counter = 0;

  const createUser = async (values = {}) => {
    counter += 1;

    const user = await User.qm.createOne({
      email: `accept-terms-${suffix}-${counter}@test.test`,
      password: await bcrypt.hash('password', 4),
      role: User.Roles.ADMIN,
      name: `Accept Terms ${counter}`,
      termsSignature: 'stale',
      ...values,
    });

    createdUserIds.push(user.id);
    return user;
  };

  const createTotpUser = (values = {}) =>
    createUser({
      isTotpEnabled: true,
      totpSecret: authenticator.generateSecret(),
      ...values,
    });

  const createPendingSession = async (user, step, issuedAt) => {
    const { token: pendingToken } = sails.helpers.utils.createJwtToken(
      step,
      issuedAt,
      PENDING_TOKEN_EXPIRES_IN,
    );

    const session = await Session.qm.createOne({
      pendingToken,
      userId: user.id,
      remoteAddress: '127.0.0.1',
    });

    return { session, pendingToken };
  };

  const acceptTerms = (pendingToken, headers = {}) =>
    request(sails.hooks.http.app)
      .post('/api/access-tokens/accept-terms')
      .set(headers)
      .send({ pendingToken, signature });

  const verifyTotp = (pendingToken, code) =>
    request(sails.hooks.http.app)
      .post('/api/access-tokens/verify-totp')
      .send({ pendingToken, code });

  before(async () => {
    ({ signature } = await sails.hooks.terms.getPayload());

    const internalConfig = await InternalConfig.qm.getOneMain();
    wasInitialized = internalConfig.isInitialized;

    if (!wasInitialized) {
      await InternalConfig.updateOne(InternalConfig.MAIN_ID).set({ isInitialized: true });
    }
  });

  after(async () => {
    if (createdUserIds.length > 0) {
      await Session.destroy({ userId: createdUserIds });
      await TrustedDevice.destroy({ userId: createdUserIds });
      await User.destroy({ id: createdUserIds });
    }

    if (!wasInitialized) {
      await InternalConfig.updateOne(InternalConfig.MAIN_ID).set({ isInitialized: false });
    }
  });

  it('requires the TOTP step for a TOTP user and then completes through it', async () => {
    const user = await createTotpUser();
    const { session, pendingToken } = await createPendingSession(
      user,
      AccessTokenSteps.ACCEPT_TERMS,
    );

    const response = await acceptTerms(pendingToken);

    expect(response.status).to.equal(403);
    expect(response.body.step).to.equal(AccessTokenSteps.VERIFY_TOTP);
    expect(response.body.pendingToken).to.be.a('string');
    expect(response.body.pendingToken).to.not.equal(pendingToken);

    const updatedUser = await User.qm.getOneById(user.id);
    expect(updatedUser.termsSignature).to.equal(signature);

    const updatedSession = await Session.findOne({ id: session.id });
    expect(updatedSession.accessToken).to.equal(null);
    expect(updatedSession.pendingToken).to.equal(response.body.pendingToken);

    const verifyResponse = await verifyTotp(
      response.body.pendingToken,
      authenticator.generate(user.totpSecret),
    );

    expect(verifyResponse.status).to.equal(200);
    expect(verifyResponse.body.item).to.be.a('string');

    const finalSession = await Session.findOne({ id: session.id });
    expect(finalSession.accessToken).to.equal(verifyResponse.body.item);
    expect(finalSession.pendingToken).to.equal(null);

    // The pending token is single use
    const replay = await verifyTotp(
      response.body.pendingToken,
      authenticator.generate(user.totpSecret),
    );
    expect(replay.status).to.equal(401);
  });

  it('skips the TOTP step on a trusted device', async () => {
    const user = await createTotpUser();
    const { plainToken } = await sails.helpers.trustedDevices.createOne.with({
      userId: user.id,
      userAgent: null,
    });

    const { pendingToken } = await createPendingSession(user, AccessTokenSteps.ACCEPT_TERMS);

    const response = await acceptTerms(pendingToken, {
      Cookie: `${TRUST_DEVICE_COOKIE_NAME}=${plainToken}`,
    });

    expect(response.status).to.equal(200);
    expect(response.body.item).to.be.a('string');
  });

  it('returns an access token for a user without TOTP', async () => {
    const user = await createUser();
    const { session, pendingToken } = await createPendingSession(
      user,
      AccessTokenSteps.ACCEPT_TERMS,
    );

    const response = await acceptTerms(pendingToken);

    expect(response.status).to.equal(200);
    expect(response.body.item).to.be.a('string');

    const updatedSession = await Session.findOne({ id: session.id });
    expect(updatedSession.accessToken).to.equal(response.body.item);
    expect(updatedSession.pendingToken).to.equal(null);
  });

  it('rejects a pending token that was already used', async () => {
    const user = await createTotpUser();
    const { pendingToken } = await createPendingSession(user, AccessTokenSteps.ACCEPT_TERMS);

    const first = await acceptTerms(pendingToken);
    expect(first.status).to.equal(403);

    const replay = await acceptTerms(pendingToken);
    expect(replay.status).to.equal(401);
  });

  it('rejects a pending token issued before a password change', async () => {
    const user = await createTotpUser();
    const { pendingToken } = await createPendingSession(
      user,
      AccessTokenSteps.ACCEPT_TERMS,
      new Date(Date.now() - 60 * 1000),
    );

    await User.updateOne(user.id).set({ passwordChangedAt: new Date().toISOString() });

    const response = await acceptTerms(pendingToken);

    expect(response.status).to.equal(401);

    const updatedUser = await User.qm.getOneById(user.id);
    expect(updatedUser.termsSignature).to.equal('stale');
  });

  it('rejects a TOTP pending token issued before a password change', async () => {
    const user = await createTotpUser({ termsSignature: signature });
    const { pendingToken } = await createPendingSession(
      user,
      AccessTokenSteps.VERIFY_TOTP,
      new Date(Date.now() - 60 * 1000),
    );

    await User.updateOne(user.id).set({ passwordChangedAt: new Date().toISOString() });

    const response = await verifyTotp(pendingToken, authenticator.generate(user.totpSecret));

    expect(response.status).to.equal(401);
  });
});
