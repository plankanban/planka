import { connect } from 'react-redux';

import selectors from '../selectors';
import Fixed from '../components/Fixed';

const mapStateToProps = (state) => {
  const { projectId } = selectors.selectPath(state);
  const currentBoard = selectors.selectCurrentBoard(state);

  return {
    projectId,
    board: currentBoard,
  };
};

export default connect(mapStateToProps)(Fixed);
