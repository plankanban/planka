import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  boardsForCurrentProjectSelector,
  isCurrentUserManagerForCurrentProjectSelector,
  pathSelector,
} from '../selectors';
import { createBoardInCurrentProject, deleteBoard, moveBoard, updateBoard } from '../actions/entry';
import Boards from '../components/Boards';

const mapStateToProps = (state) => {
  const { boardId } = pathSelector(state);
  const boards = boardsForCurrentProjectSelector(state);
  const isCurrentUserManager = isCurrentUserManagerForCurrentProjectSelector(state);

  return {
    items: boards,
    currentId: boardId,
    canEdit: isCurrentUserManager,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCreate: createBoardInCurrentProject,
      onUpdate: updateBoard,
      onMove: moveBoard,
      onDelete: deleteBoard,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Boards);
