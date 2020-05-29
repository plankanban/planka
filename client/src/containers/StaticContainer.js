import { connect } from 'react-redux';

import { pathSelector } from '../selectors';
import Static from '../components/Static';

const mapStateToProps = (state) => {
  const { cardId, boardId, projectId } = pathSelector(state);

  return {
    cardId,
    boardId,
    projectId,
  };
};

export default connect(mapStateToProps)(Static);
