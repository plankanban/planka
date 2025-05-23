const { expect } = require('chai');

describe('User (model)', () => {
  before(async () => {
    await User.qm.createOne({
      email: 'test@test.test',
      password: 'test',
      role: User.Roles.ADMIN,
      name: 'test',
    });
  });

  describe('#find()', () => {
    it('should return 1 user', async () => {
      const users = await User.find();

      expect(users).to.have.lengthOf(1);
    });
  });
});
