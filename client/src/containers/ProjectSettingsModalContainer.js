import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  currentProjectSelector,
  managersForCurrentProjectSelector,
  usersSelector,
} from '../selectors';
import {
  closeModal,
  createManagerInCurrentProject,
  deleteCurrentProject,
  deleteProjectManager,
  updateCurrentProject,
  updateCurrentProjectBackgroundImage,
} from '../actions/entry';
import ProjectSettingsModal from '../components/ProjectSettingsModal';

const mapStateToProps = (state) => {
  const users = usersSelector(state);

  const { name, background, backgroundImage, isBackgroundImageUpdating } =
    currentProjectSelector(state);

  const managers = managersForCurrentProjectSelector(state);

  return {
    name,
    background,
    backgroundImage,
    isBackgroundImageUpdating,
    managers,
    allUsers: users,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: updateCurrentProject,
      onBackgroundImageUpdate: updateCurrentProjectBackgroundImage,
      onDelete: deleteCurrentProject,
      onManagerCreate: createManagerInCurrentProject,
      onManagerDelete: deleteProjectManager,
      onClose: closeModal,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSettingsModal);
