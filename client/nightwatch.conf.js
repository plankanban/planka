const path = require('path');
const LAUNCH_URL = process.env.LAUNCH_URL || 'http://localhost:3000';

module.exports = {
  page_objects_path: path.join(__dirname, 'tests' , 'acceptance', 'pageObjects'),
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