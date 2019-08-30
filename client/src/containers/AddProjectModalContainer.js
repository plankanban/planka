import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { closeModal, createProject } from '../actions/entry';
import AddProjectModal from '../components/AddProjectModal';

const mapStateToProps = ({ project: { data: defaultData, isSubmitting } }) => ({
  defaultData,
  isSubmitting,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    onCreate: createProject,
    onClose: closeModal,
  },
  dispatch,
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddProjectModal);
