import { connect } from 'react-redux';

import { pathSelector } from '../selectors';
import StaticWrapper from '../components/StaticWrapper';

const mapStateToProps = (state) => {
  const { cardId, boardId, projectId } = pathSelector(state);

  return {
    cardId,
    boardId,
    projectId,
  };
};

export default connect(mapStateToProps)(StaticWrapper);
