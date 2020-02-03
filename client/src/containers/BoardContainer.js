import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  filterLabelsForCurrentBoardSelector,
  filterUsersForCurrentBoardSelector,
  labelsForCurrentBoardSelector,
  listIdsForCurrentBoardSelector,
  membershipsForCurrentProjectSelector,
  pathSelector,
} from '../selectors';
import {
  addLabelToFilterInCurrentBoard,
  addUserToFilterInCurrentBoard,
  createLabelInCurrentBoard,
  createListInCurrentBoard,
  deleteLabel,
  moveCard,
  moveList,
  removeLabelFromFilterInCurrentBoard,
  removeUserFromFilterInCurrentBoard,
  updateLabel,
} from '../actions/entry';
import Board from '../components/Board';

const mapStateToProps = state => {
  const { cardId } = pathSelector(state);
  const allProjectMemberships = membershipsForCurrentProjectSelector(state);
  const listIds = listIdsForCurrentBoardSelector(state);
  const allLabels = labelsForCurrentBoardSelector(state);
  const filterUsers = filterUsersForCurrentBoardSelector(state);
  const filterLabels = filterLabelsForCurrentBoardSelector(state);

  return {
    listIds,
    filterUsers,
    filterLabels,
    allProjectMemberships,
    allLabels,
    isCardModalOpened: !!cardId,
  };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      onListCreate: createListInCurrentBoard,
      onCardMove: moveCard,
      onListMove: moveList,
      onUserToFilterAdd: addUserToFilterInCurrentBoard,
      onUserFromFilterRemove: removeUserFromFilterInCurrentBoard,
      onLabelToFilterAdd: addLabelToFilterInCurrentBoard,
      onLabelFromFilterRemove: removeLabelFromFilterInCurrentBoard,
      onLabelCreate: createLabelInCurrentBoard,
      onLabelUpdate: updateLabel,
      onLabelDelete: deleteLabel,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Board);
