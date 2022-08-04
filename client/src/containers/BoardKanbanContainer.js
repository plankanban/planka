import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import BoardKanban from '../components/BoardKanban';

const mapStateToProps = (state) => {
  const { cardId } = selectors.selectPath(state);
  const isCurrentUserMember = selectors.selectIsCurrentUserMemberForCurrentBoard(state);
  const listIds = selectors.selectListIdsForCurrentBoard(state);

  return {
    listIds,
    isCardModalOpened: !!cardId,
    canEdit: isCurrentUserMember,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onListCreate: entryActions.createListInCurrentBoard,
      onListMove: entryActions.moveList,
      onCardMove: entryActions.moveCard,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(BoardKanban);
