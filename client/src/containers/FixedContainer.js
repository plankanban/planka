import { connect } from 'react-redux';

import { currentBoardSelector, pathSelector } from '../selectors';
import Fixed from '../components/Fixed';

const mapStateToProps = (state) => {
  const { projectId } = pathSelector(state);
  const currentBoard = currentBoardSelector(state);

  return {
    projectId,
    board: currentBoard,
  };
};

export default connect(mapStateToProps)(Fixed);
