import { combineReducers } from 'redux';

import authenticate from './authenticate';
import userCreate from './user-create';
import projectCreate from './project-create';

export default combineReducers({
  authenticate,
  userCreate,
  projectCreate,
});
