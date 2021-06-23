import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  filterLabelsForCurrentBoardSelector,
  filterUsersForCurrentBoardSelector,
  isCurrentUserManagerForCurrentProjectSelector,
  labelsForCurrentBoardSelector,
  membershipsForCurrentBoardSelector,
  usersSelector,
} from '../selectors';
import {
  addLabelToFilterInCurrentBoard,
  addUserToFilterInCurrentBoard,
  createLabelInCurrentBoard,
  createMembershipInCurrentBoard,
  deleteBoardMembership,
  deleteLabel,
  removeLabelFromFilterInCurrentBoard,
  removeUserFromFilterInCurrentBoard,
  updateLabel,
} from '../actions/entry';
import BoardActions from '../components/BoardActions';

const mapStateToProps = (state) => {
  const allUsers = usersSelector(state);
  const isCurrentUserManager = isCurrentUserManagerForCurrentProjectSelector(state);
  const memberships = membershipsForCurrentBoardSelector(state);
  const labels = labelsForCurrentBoardSelector(state);
  const filterUsers = filterUsersForCurrentBoardSelector(state);
  const filterLabels = filterLabelsForCurrentBoardSelector(state);

  return {
    memberships,
    labels,
    filterUsers,
    filterLabels,
    allUsers,
    canEditMemberships: isCurrentUserManager,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onMembershipCreate: createMembershipInCurrentBoard,
      onMembershipDelete: deleteBoardMembership,
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

export default connect(mapStateToProps, mapDispatchToProps)(BoardActions);
