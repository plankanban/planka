const { expect } = require('chai');

describe('User (model)', () => {
  before(async () => {
    await InternalConfig.findOrCreate(
      {
        id: InternalConfig.MAIN_ID,
      },
      {
        id: InternalConfig.MAIN_ID,
        activeUsersLimit: null,
        isInitialized: true,
      },
    );
  });

  describe('dueDateColorScheme', () => {
    it('should expose due date color schemes as a personal preference', () => {
      expect(User.DueDateColorSchemes).to.deep.equal({
        DEFAULT: 'default',
        BLUE_ORANGE: 'blueOrange',
      });

      expect(User.PERSONAL_FIELD_NAMES).to.include('dueDateColorScheme');
    });

    it('should default to the default due date color scheme', async () => {
      const user = await User.qm.createOne({
        email: 'due-date-color-default@test.test',
        password: 'test',
        role: User.Roles.ADMIN,
        name: 'Due Date Color Default',
      });

      expect(user.dueDateColorScheme).to.equal(User.DueDateColorSchemes.DEFAULT);
    });

    it('should reject unsupported due date color schemes', async () => {
      let error;

      try {
        await User.qm.createOne({
          email: 'due-date-color-invalid@test.test',
          password: 'test',
          role: User.Roles.ADMIN,
          name: 'Due Date Color Invalid',
          dueDateColorScheme: 'unknown',
        });
      } catch (caughtError) {
        error = caughtError;
      }

      expect(error).to.not.equal(undefined);
    });
  });
});
