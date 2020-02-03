import { connect } from 'react-redux';

import { pathSelector } from '../selectors';
import ProjectWrapper from '../components/ProjectWrapper';

const mapStateToProps = state => {
  const { cardId, boardId, projectId } = pathSelector(state);

  return {
    isProjectNotFound: projectId === null,
    isBoardNotFound: boardId === null,
    isCardNotFound: cardId === null,
  };
};

export default connect(mapStateToProps)(ProjectWrapper);
