import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { currentUserSelector, notificationsForCurrentUserSelector } from '../selectors';
import {
  clearCurrentUserEmailUpdateError,
  clearCurrentUserPasswordUpdateError,
  deleteNotification,
  logout,
  openUsersModal,
  updateCurrentUser,
  updateCurrentUserEmail,
  updateCurrentUserPassword,
  uploadCurrentUserAvatar,
} from '../actions/entry';
import Header from '../components/Header';

const mapStateToProps = (state) => {
  const currentUser = currentUserSelector(state);
  const notifications = notificationsForCurrentUserSelector(state);

  return {
    notifications,
    user: currentUser,
    isEditable: currentUser.isAdmin,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUsers: openUsersModal, // TODO: rename
      onNotificationDelete: deleteNotification,
      onUserUpdate: updateCurrentUser,
      onUserAvatarUpload: uploadCurrentUserAvatar,
      onUserEmailUpdate: updateCurrentUserEmail,
      onUserEmailUpdateMessageDismiss: clearCurrentUserEmailUpdateError,
      onUserPasswordUpdate: updateCurrentUserPassword,
      onUserPasswordUpdateMessageDismiss: clearCurrentUserPasswordUpdateError,
      onLogout: logout,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Header);
