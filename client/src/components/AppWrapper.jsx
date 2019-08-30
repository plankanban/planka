import React from 'react';
import PropTypes from 'prop-types';
import { Loader } from 'semantic-ui-react';

import AppContainer from '../containers/AppContainer';
import SocketStatusContainer from '../containers/SocketStatusContainer';

const AppWrapper = React.memo(({ isInitializing }) => (
  <>
    {isInitializing ? <Loader active size="massive" /> : <AppContainer />}
    <SocketStatusContainer />
  </>
));

AppWrapper.propTypes = {
  isInitializing: PropTypes.bool.isRequired,
};

export default AppWrapper;
