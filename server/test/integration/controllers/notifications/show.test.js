const { expect } = require('chai');
const request = require('supertest');
const bcrypt = require('bcrypt');

const FORBIDDEN_FIELD_NAMES = [
  'password',
  'apiKeyHash',
  'apiKeyPrefix',
  'apiKeyCreatedAt',
  'totpSecret',
  'totpRecoveryCodes',
  'termsSignature',
  'termsAcceptedAt',
  'passwordChangedAt',
  'email',
  'language',
  'subscribeToOwnCards',
  'subscribeToCardWhenCommenting',
  'turnOffRecentCardHighlighting',
  'enableFavoritesByDefault',
  'defaultEditorMode',
  'defaultHomeView',
  'defaultProjectsOrder',
  'autoLogoutMode',
  'isTotpEnabled',
  'totpEnabledAt',
  'totpRecoveryCodesRemaining',
  'isDefaultAdmin',
  'lockedFieldNames',
];

describe('GET /api/notifications/:id', () => {
  const suffix = Date.now().toString(36);
  const userIds = [];
  let counter = 0;
  let idCounter = 0;

  // The in-memory test datastore does not generate the string ids the models expect
  const nextId = () => {
    idCounter += 1;
    return `${Date.now()}${idCounter}`;
  };
  let project;
  let board;
  let list;
  let card;
  let creator;
  let recipient;
  let stranger;
  let notification;

  const createUser = async (values = {}) => {
    counter += 1;

    const user = await User.qm.createOne({
      id: nextId(),
      email: `notification-show-${suffix}-${counter}@test.test`,
      password: await bcrypt.hash('password', 4),
      role: User.Roles.BOARD_USER,
      name: `Notification Show ${counter}`,
      ...values,
    });

    userIds.push(user.id);
    return user;
  };

  const createAccessToken = async (user) => {
    const { token } = sails.helpers.utils.createJwtToken(user.id, new Date(), 60 * 60);

    await Session.qm.createOne({
      id: nextId(),
      accessToken: token,
      userId: user.id,
      remoteAddress: '127.0.0.1',
    });

    return token;
  };

  const getNotification = (id, accessToken) => {
    const req = request(sails.hooks.http.app).get(`/api/notifications/${id}`);

    return accessToken ? req.set('Authorization', `Bearer ${accessToken}`) : req;
  };

  before(async () => {
    creator = await createUser({
      phone: '123',
      apiKeyPrefix: 'abcd1234',
      apiKeyHash: 'api-key-hash',
      apiKeyCreatedAt: new Date(),
      termsSignature: 'terms-signature',
      termsAcceptedAt: new Date(),
      isTotpEnabled: true,
      totpSecret: 'totp-secret',
      totpRecoveryCodes: ['recovery-code'],
    });

    recipient = await createUser();
    stranger = await createUser();

    project = await Project.create({ id: nextId(), name: `Notification Show ${suffix}` }).fetch();

    board = await Board.create({
      id: nextId(),
      projectId: project.id,
      position: 1,
      name: 'Board',
    }).fetch();

    list = await List.create({
      id: nextId(),
      boardId: board.id,
      type: List.Types.ACTIVE,
      position: 1,
      name: 'List',
    }).fetch();

    card = await Card.create({
      id: nextId(),
      boardId: board.id,
      listId: list.id,
      creatorUserId: creator.id,
      type: Card.Types.PROJECT,
      position: 1,
      name: 'Card',
    }).fetch();

    notification = await Notification.create({
      id: nextId(),
      userId: recipient.id,
      creatorUserId: creator.id,
      boardId: board.id,
      cardId: card.id,
      type: Notification.Types.ADD_MEMBER_TO_CARD,
      data: { card: { name: card.name } },
    }).fetch();
  });

  after(async () => {
    await Notification.destroy({ id: notification.id });
    await Card.destroy({ id: card.id });
    await List.destroy({ id: list.id });
    await Board.destroy({ id: board.id });
    await Project.destroy({ id: project.id });
    await Session.destroy({ userId: userIds });
    await User.destroy({ id: userIds });
  });

  it('returns the creator without private or credential fields to the recipient', async () => {
    const accessToken = await createAccessToken(recipient);

    const response = await getNotification(notification.id, accessToken);

    expect(response.status).to.equal(200);
    expect(response.body.item.id).to.equal(notification.id);
    expect(response.body.included.users).to.have.lengthOf(1);

    const [user] = response.body.included.users;

    expect(user.id).to.equal(creator.id);
    expect(user.name).to.equal(creator.name);

    FORBIDDEN_FIELD_NAMES.forEach((fieldName) => {
      expect(user, fieldName).to.not.have.property(fieldName);
    });

    const serialized = JSON.stringify(response.body);

    ['api-key-hash', 'totp-secret', 'recovery-code', 'terms-signature', creator.email].forEach(
      (value) => {
        expect(serialized).to.not.include(value);
      },
    );
  });

  it('responds with 404 to a user who does not own the notification', async () => {
    const accessToken = await createAccessToken(stranger);

    const response = await getNotification(notification.id, accessToken);

    expect(response.status).to.equal(404);
  });

  it('responds with 401 without credentials', async () => {
    const response = await getNotification(notification.id);

    expect(response.status).to.equal(401);
  });

  it('does not serialize credential columns from a raw user record', async () => {
    const user = await User.qm.getOneById(creator.id);
    const json = JSON.parse(JSON.stringify(user));

    expect(user.apiKeyHash).to.equal('api-key-hash');
    expect(user.totpSecret).to.equal('totp-secret');
    expect(json).to.have.property('id', creator.id);

    ['password', 'apiKeyHash', 'termsSignature', 'totpSecret', 'totpRecoveryCodes'].forEach(
      (fieldName) => {
        expect(json, fieldName).to.not.have.property(fieldName);
      },
    );
  });
});
