import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  isCurrentUserMemberForCurrentBoardSelector,
  listIdsForCurrentBoardSelector,
  pathSelector,
} from '../selectors';
import { createListInCurrentBoard, moveCard, moveList } from '../actions/entry';
import BoardKanban from '../components/BoardKanban';

const mapStateToProps = (state) => {
  const { cardId } = pathSelector(state);
  const isCurrentUserMember = isCurrentUserMemberForCurrentBoardSelector(state);
  const listIds = listIdsForCurrentBoardSelector(state);

  return {
    listIds,
    isCardModalOpened: !!cardId,
    canEdit: isCurrentUserMember,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onListCreate: createListInCurrentBoard,
      onListMove: moveList,
      onCardMove: moveCard,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(BoardKanban);
