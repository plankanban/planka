import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { currentUserSelector, notificationsForCurrentUserSelector } from '../selectors';
import {
  deleteNotification,
  logout,
  openUserSettingsModal,
  openUsersModal,
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
      onUserSettings: openUserSettingsModal,
      onLogout: logout,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Header);
