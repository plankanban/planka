import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  currentProjectSelector,
  currentUserSelector,
  isCurrentUserManagerForCurrentProjectSelector,
  notificationsForCurrentUserSelector,
} from '../selectors';
import {
  deleteNotification,
  logout,
  openProjectSettingsModal,
  openUserSettingsModal,
  openUsersModal,
} from '../actions/entry';
import Header from '../components/Header';

const mapStateToProps = (state) => {
  const currentUser = currentUserSelector(state);
  const currentProject = currentProjectSelector(state);
  const notifications = notificationsForCurrentUserSelector(state);
  const isCurrentUserManager = isCurrentUserManagerForCurrentProjectSelector(state);

  return {
    notifications,
    project: currentProject,
    user: currentUser,
    canEditProject: isCurrentUserManager,
    canEditUsers: currentUser.isAdmin,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onProjectSettingsClick: openProjectSettingsModal,
      onUsersClick: openUsersModal,
      onNotificationDelete: deleteNotification,
      onUserSettingsClick: openUserSettingsModal,
      onLogout: logout,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Header);
