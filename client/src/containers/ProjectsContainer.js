import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { currentUserSelector, pathSelector, projectsForCurrentUserSelector } from '../selectors';
import { openAddProjectModal } from '../actions/entry';
import Projects from '../components/Projects';

const mapStateToProps = (state) => {
  const { projectId } = pathSelector(state);
  const { isAdmin } = currentUserSelector(state);
  const projects = projectsForCurrentUserSelector(state);

  return {
    items: projects,
    currentId: projectId,
    isEditable: isAdmin,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onAdd: openAddProjectModal,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Projects);
