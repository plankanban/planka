const LAUNCH_URL = process.env.LAUNCH_URL || 'http://localhost:3000';

module.exports = {
  test_settings: {
    default: {
      launch_url: LAUNCH_URL,
      selenium: {
        start_process: false,
        host: 'localhost',
        port: 4444,
      },
      desiredCapabilities: {
        browserName: 'chrome',
      },
    },
  },
};
