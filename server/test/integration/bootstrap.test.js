// Root-level hooks shared by all integration tests: the in-memory test datastore starts
// without the main internal config row that the request policies expect.
let createdInternalConfig = false;

before(async () => {
  if (!(await InternalConfig.qm.getOneMain())) {
    await InternalConfig.create({ id: InternalConfig.MAIN_ID, isInitialized: true });
    createdInternalConfig = true;
  }
});

after(async () => {
  if (createdInternalConfig) {
    await InternalConfig.destroy({ id: InternalConfig.MAIN_ID });
  }
});
