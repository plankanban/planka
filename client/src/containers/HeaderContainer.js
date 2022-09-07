import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import Header from '../components/Header';

const mapStateToProps = (state) => {
  const isLogouting = selectors.selectIsLogouting(state);
  const currentUser = selectors.selectCurrentUser(state);
  const currentProject = selectors.selectCurrentProject(state);
  const notifications = selectors.selectNotificationsForCurrentUser(state);
  const isCurrentUserManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);

  return {
    notifications,
    isLogouting,
    project: currentProject,
    user: currentUser,
    canEditProject: isCurrentUserManager,
    canEditUsers: currentUser.isAdmin,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onProjectSettingsClick: entryActions.openProjectSettingsModal,
      onUsersClick: entryActions.openUsersModal,
      onNotificationDelete: entryActions.deleteNotification,
      onUserSettingsClick: entryActions.openUserSettingsModal,
      onLogout: entryActions.logout,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Header);
