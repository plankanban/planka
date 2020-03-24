import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  allUsersSelector,
  currentProjectSelector,
  currentUserSelector,
  membershipsForCurrentProjectSelector,
} from '../selectors';
import {
  createMembershipInCurrentProject,
  deleteCurrentProject,
  deleteProjectMembership,
  updateCurrentProject,
} from '../actions/entry';
import Project from '../components/Project';

const mapStateToProps = (state) => {
  const allUsers = allUsersSelector(state);
  const { isAdmin } = currentUserSelector(state);
  const { name } = currentProjectSelector(state);
  const memberships = membershipsForCurrentProjectSelector(state);

  return {
    name,
    memberships,
    allUsers,
    isEditable: isAdmin,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: updateCurrentProject,
      onDelete: deleteCurrentProject,
      onMembershipCreate: createMembershipInCurrentProject,
      onMembershipDelete: deleteProjectMembership,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Project);
