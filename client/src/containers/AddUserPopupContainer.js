import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { clearUserCreateError, createUser } from '../actions/entry';
import AddUserPopup from '../components/AddUserPopup';

const mapStateToProps = ({ userCreateForm: { data: defaultData, isSubmitting, error } }) => ({
  defaultData,
  isSubmitting,
  error,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCreate: createUser,
      onMessageDismiss: clearUserCreateError,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(AddUserPopup);
