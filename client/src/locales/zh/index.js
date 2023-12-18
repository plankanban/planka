import merge from 'lodash/merge';

import login from './login';
import core from './core';

export default {
  language: 'zh',
  country: 'cn',
  name: '中文',
  embeddedLocale: merge(login, core),
};
