import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import { BoardMembershipRoles } from '../constants/Enums';
import List from '../components/List';

const makeMapStateToProps = () => {
  const selectListById = selectors.makeSelectListById();
  const selectCardIdsByListId = selectors.makeSelectCardIdsByListId();

  return (state, { id, index }) => {
    const { name, isPersisted } = selectListById(state, id);
    const cardIds = selectCardIdsByListId(state, id);
    const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

    return {
      id,
      index,
      name,
      isPersisted,
      cardIds,
      canEdit:
        !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR,
    };
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
      onUpdate: (data) => entryActions.updateList(id, data),
      onDelete: () => entryActions.deleteList(id),
      onCardCreate: (data) => entryActions.createCard(id, data),
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(List);
