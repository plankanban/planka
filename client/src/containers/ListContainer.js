import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  isCurrentUserMemberForCurrentBoardSelector,
  makeCardIdsByListIdSelector,
  makeListByIdSelector,
} from '../selectors';
import { createCard, deleteList, updateList } from '../actions/entry';
import List from '../components/List';

const makeMapStateToProps = () => {
  const listByIdSelector = makeListByIdSelector();
  const cardIdsByListIdSelector = makeCardIdsByListIdSelector();

  return (state, { id, index }) => {
    const { name, isPersisted } = listByIdSelector(state, id);
    const cardIds = cardIdsByListIdSelector(state, id);
    const isCurrentUserMember = isCurrentUserMemberForCurrentBoardSelector(state);

    return {
      id,
      index,
      name,
      isPersisted,
      cardIds,
      canEdit: isCurrentUserMember,
    };
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
      onUpdate: (data) => updateList(id, data),
      onDelete: () => deleteList(id),
      onCardCreate: (data) => createCard(id, data),
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(List);
