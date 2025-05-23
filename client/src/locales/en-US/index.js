import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'en-US',
  country: 'us',
  name: 'English',
  embeddedLocale: merge(login, core),
};
