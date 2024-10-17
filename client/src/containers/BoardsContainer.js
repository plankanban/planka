import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import Boards from '../components/Boards';

const mapStateToProps = (state) => {
  const { boardId } = selectors.selectPath(state);
  const boards = selectors.selectBoardsForCurrentProject(state);
  const isCurrentUserManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);

  return {
    items: boards,
    currentId: boardId,
    canEdit: isCurrentUserManager,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCreate: entryActions.createBoardInCurrentProject,
      onUpdate: entryActions.updateBoard,
      onMove: entryActions.moveBoard,
      onDelete: entryActions.deleteBoard,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Boards);
