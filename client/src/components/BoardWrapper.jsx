import React from 'react';
import PropTypes from 'prop-types';
import { Loader } from 'semantic-ui-react';

import BoardContainer from '../containers/BoardContainer';

const BoardWrapper = React.memo(({ isFetching }) => {
  if (isFetching) {
    return <Loader active />;
  }

  return <BoardContainer />;
});

BoardWrapper.propTypes = {
  isFetching: PropTypes.bool.isRequired,
};

export default BoardWrapper;
