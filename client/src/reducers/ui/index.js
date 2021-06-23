import { combineReducers } from 'redux';

import authenticateForm from './authenticate-form';
import userCreateForm from './user-create-form';
import projectCreateForm from './project-create-form';

export default combineReducers({
  authenticateForm,
  userCreateForm,
  projectCreateForm,
});
