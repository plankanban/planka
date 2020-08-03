import React from 'react';
import PropTypes from 'prop-types';
import { Loader } from 'semantic-ui-react';

import { BoardTypes } from '../constants/Enums';
import BoardKanbanContainer from '../containers/BoardKanbanContainer';

const BoardWrapper = React.memo(({ type, isFetching }) => {
  if (isFetching) {
    return <Loader active />;
  }

  if (type === BoardTypes.KANBAN) {
    return <BoardKanbanContainer />;
  }

  return null;
});

BoardWrapper.propTypes = {
  type: PropTypes.string.isRequired,
  isFetching: PropTypes.bool.isRequired,
};

export default BoardWrapper;
