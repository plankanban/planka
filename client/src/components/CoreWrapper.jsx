import React from 'react';
import PropTypes from 'prop-types';
import { Loader } from 'semantic-ui-react';

import CoreContainer from '../containers/CoreContainer';
import SocketStatusContainer from '../containers/SocketStatusContainer';

const CoreWrapper = React.memo(({ isInitializing }) => (
  <>
    {isInitializing ? <Loader active size="massive" /> : <CoreContainer />}
    <SocketStatusContainer />
  </>
));

CoreWrapper.propTypes = {
  isInitializing: PropTypes.bool.isRequired,
};

export default CoreWrapper;
