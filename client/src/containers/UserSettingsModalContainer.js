import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { currentUserSelector } from '../selectors';
import {
  clearCurrentUserEmailUpdateError,
  clearCurrentUserPasswordUpdateError,
  clearCurrentUserUsernameUpdateError,
  closeModal,
  updateCurrentUser,
  updateCurrentUserEmail,
  updateCurrentUserPassword,
  updateCurrentUserUsername,
  uploadCurrentUserAvatar,
} from '../actions/entry';
import UserSettingsModal from '../components/UserSettingsModal';

const mapStateToProps = (state) => {
  const {
    email,
    name,
    username,
    avatar,
    phone,
    organization,
    isAvatarUploading,
    emailUpdateForm,
    passwordUpdateForm,
    usernameUpdateForm,
  } = currentUserSelector(state);

  return {
    email,
    name,
    username,
    avatar,
    phone,
    organization,
    isAvatarUploading,
    emailUpdateForm,
    passwordUpdateForm,
    usernameUpdateForm,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: updateCurrentUser,
      onAvatarUpload: uploadCurrentUserAvatar,
      onUsernameUpdate: updateCurrentUserUsername,
      onUsernameUpdateMessageDismiss: clearCurrentUserUsernameUpdateError,
      onEmailUpdate: updateCurrentUserEmail,
      onEmailUpdateMessageDismiss: clearCurrentUserEmailUpdateError,
      onPasswordUpdate: updateCurrentUserPassword,
      onPasswordUpdateMessageDismiss: clearCurrentUserPasswordUpdateError,
      onClose: closeModal,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsModal);
