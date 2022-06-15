import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { usersExceptCurrentSelector } from '../selectors';
import {
  clearUserEmailUpdateError,
  clearUserPasswordUpdateError,
  clearUserUsernameUpdateError,
  closeModal,
  deleteUser,
  updateUser,
  updateUserEmail,
  updateUserPassword,
  updateUserUsername,
} from '../actions/entry';
import UsersModal from '../components/UsersModal';

const mapStateToProps = (state) => {
  const users = usersExceptCurrentSelector(state);

  return {
    items: users,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: updateUser,
      onUsernameUpdate: updateUserUsername,
      onUsernameUpdateMessageDismiss: clearUserUsernameUpdateError,
      onEmailUpdate: updateUserEmail,
      onEmailUpdateMessageDismiss: clearUserEmailUpdateError,
      onPasswordUpdate: updateUserPassword,
      onPasswordUpdateMessageDismiss: clearUserPasswordUpdateError,
      onDelete: deleteUser,
      onClose: closeModal,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(UsersModal);
