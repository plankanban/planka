/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { combineReducers } from 'redux';

import authenticateForm from './authenticate-form';
import userCreateForm from './user-create-form';
import projectCreateForm from './project-create-form';
import smtpTestState from './smtp-test-state';

export default combineReducers({
  authenticateForm,
  userCreateForm,
  projectCreateForm,
  smtpTestState,
});
