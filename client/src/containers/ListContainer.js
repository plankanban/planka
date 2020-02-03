import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { makeCardIdsByListIdSelector, makeListByIdSelector } from '../selectors';
import { createCard, deleteList, updateList } from '../actions/entry';
import List from '../components/List';

const makeMapStateToProps = () => {
  const listByIdSelector = makeListByIdSelector();
  const cardIdsByListIdSelector = makeCardIdsByListIdSelector();

  return (state, { id, index }) => {
    const { name, isPersisted } = listByIdSelector(state, id);
    const cardIds = cardIdsByListIdSelector(state, id);

    return {
      id,
      index,
      name,
      isPersisted,
      cardIds,
    };
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
      onUpdate: data => updateList(id, data),
      onDelete: () => deleteList(id),
      onCardCreate: data => createCard(id, data),
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(List);
