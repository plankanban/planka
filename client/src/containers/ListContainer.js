import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import omit from 'lodash/omit';

import {
  isAnyFilterActiveForCurrentBoardSelector,
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
    const isAnyFilterActive = isAnyFilterActiveForCurrentBoardSelector(state);

    return {
      id,
      index,
      name,
      isPersisted,
      cardIds,
      isDeletable: !isAnyFilterActive,
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

const mergeProps = (stateProps, dispatchProps) => ({
  ...omit(stateProps, 'isDeletable'),
  ...(stateProps.isDeletable ? dispatchProps : omit(dispatchProps, 'onDelete')),
});

export default connect(makeMapStateToProps, mapDispatchToProps, mergeProps)(List);
