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
import BoardKanban from '../components/BoardKanban';

const mapStateToProps = (state) => {
  const { cardId } = pathSelector(state);
  const allProjectMemberships = membershipsForCurrentProjectSelector(state);
  const allLabels = labelsForCurrentBoardSelector(state);
  const listIds = listIdsForCurrentBoardSelector(state);
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

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onListCreate: createListInCurrentBoard,
      onListMove: moveList,
      onCardMove: moveCard,
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

export default connect(mapStateToProps, mapDispatchToProps)(BoardKanban);
