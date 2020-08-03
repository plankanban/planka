import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { closeModal, createProject } from '../actions/entry';
import ProjectAddModal from '../components/ProjectAddModal';

const mapStateToProps = ({ projectCreateForm: { data: defaultData, isSubmitting } }) => ({
  defaultData,
  isSubmitting,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCreate: createProject,
      onClose: closeModal,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProjectAddModal);
