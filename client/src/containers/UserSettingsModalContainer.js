import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
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
    isLocked,
    isUsernameLocked,
    isAvatarUpdating,
    emailUpdateForm,
    passwordUpdateForm,
    usernameUpdateForm,
  } = selectors.selectCurrentUser(state);

  return {
    email,
    name,
    username,
    avatarUrl,
    phone,
    organization,
    language,
    subscribeToOwnCards,
    isLocked,
    isUsernameLocked,
    isAvatarUpdating,
    emailUpdateForm,
    passwordUpdateForm,
    usernameUpdateForm,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: entryActions.updateCurrentUser,
      onAvatarUpdate: entryActions.updateCurrentUserAvatar,
      onLanguageUpdate: entryActions.updateCurrentUserLanguage,
      onUsernameUpdate: entryActions.updateCurrentUserUsername,
      onUsernameUpdateMessageDismiss: entryActions.clearCurrentUserUsernameUpdateError,
      onEmailUpdate: entryActions.updateCurrentUserEmail,
      onEmailUpdateMessageDismiss: entryActions.clearCurrentUserEmailUpdateError,
      onPasswordUpdate: entryActions.updateCurrentUserPassword,
      onPasswordUpdateMessageDismiss: entryActions.clearCurrentUserPasswordUpdateError,
      onClose: entryActions.closeModal,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsModal);
