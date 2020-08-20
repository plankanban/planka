const { expect } = require('chai');

describe('User (model)', () => {
  before(async () => {
    await User.create({
      email: 'test@test.test',
      password: 'test',
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
