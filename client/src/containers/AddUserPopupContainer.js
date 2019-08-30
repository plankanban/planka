import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { clearUserCreationError, createUser } from '../actions/entry';
import AddUserPopup from '../components/AddUserPopup';

const mapStateToProps = ({ user: { data: defaultData, isSubmitting, error: externalError } }) => {
  let error;

  if (externalError) {
    if (externalError.message === 'User is already exist') {
      error = {
        message: 'userIsAlreadyExist',
      };
    } else {
      error = {
        type: 'warning',
        message: 'unknownError',
      };
    }
  }

  return {
    defaultData,
    isSubmitting,
    error,
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    onCreate: createUser,
    onMessageDismiss: clearUserCreationError,
  },
  dispatch,
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddUserPopup);
