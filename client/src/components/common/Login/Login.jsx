/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Loader } from 'semantic-ui-react';

import selectors from '../../../selectors';
import Content from './Content';

const Login = React.memo(() => {
  const isInitializing = useSelector(selectors.selectIsInitializing);

  return isInitializing ? <Loader active size="massive" /> : <Content />;
});

export default Login;
