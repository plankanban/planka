import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { currentUserSelector } from '../selectors';
import {
  clearCurrentUserEmailUpdateError,
  clearCurrentUserPasswordUpdateError,
  clearCurrentUserUsernameUpdateError,
  closeModal,
  updateCurrentUser,
  updateCurrentUserAvatar,
  updateCurrentUserEmail,
  updateCurrentUserLanguage,
  updateCurrentUserPassword,
  updateCurrentUserUsername,
} from '../actions/entry';
import UserSettingsModal from '../components/UserSettingsModal';

const mapStateToProps = (state) => {
  const {
    email,
    name,
    username,
    avatarUrl,
    phone,
    organization,
    language,
    subscribeToOwnCards,
    isAvatarUpdating,
    emailUpdateForm,
    passwordUpdateForm,
    usernameUpdateForm,
  } = currentUserSelector(state);

  return {
    email,
    name,
    username,
    avatarUrl,
    phone,
    organization,
    language,
    subscribeToOwnCards,
    isAvatarUpdating,
    emailUpdateForm,
    passwordUpdateForm,
    usernameUpdateForm,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: updateCurrentUser,
      onAvatarUpdate: updateCurrentUserAvatar,
      onLanguageUpdate: updateCurrentUserLanguage,
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
