import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'el-GR',
  country: 'gr',
  name: 'Ελληνικά',
  embeddedLocale: merge(login, core),
};
