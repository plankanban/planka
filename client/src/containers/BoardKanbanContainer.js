import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import { BoardMembershipRoles } from '../constants/Enums';
import BoardKanban from '../components/BoardKanban';

const mapStateToProps = (state) => {
  const { cardId } = selectors.selectPath(state);
  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
  const listIds = selectors.selectListIdsForCurrentBoard(state);

  return {
    listIds,
    isCardModalOpened: !!cardId,
    canEdit: !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR,
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
