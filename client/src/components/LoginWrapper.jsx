import React from 'react';
import PropTypes from 'prop-types';
import { Loader } from 'semantic-ui-react';

import LoginContainer from '../containers/LoginContainer';

const LoginWrapper = React.memo(({ isInitializing }) => {
  if (isInitializing) {
    return <Loader active size="massive" />;
  }

  return <LoginContainer />;
});

LoginWrapper.propTypes = {
  isInitializing: PropTypes.bool.isRequired,
};

export default LoginWrapper;
