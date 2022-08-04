import { connect } from 'react-redux';

import selectors from '../selectors';
import Static from '../components/Static';

const mapStateToProps = (state) => {
  const { cardId, boardId, projectId } = selectors.selectPath(state);

  return {
    cardId,
    boardId,
    projectId,
  };
};

export default connect(mapStateToProps)(Static);
