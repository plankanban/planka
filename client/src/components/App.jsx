import React from 'react';
import PropTypes from 'prop-types';

import HeaderContainer from '../containers/HeaderContainer';
import ProjectsContainer from '../containers/ProjectsContainer';
import UsersModalContainer from '../containers/UsersModalContainer';
import UserSettingsModalContainer from '../containers/UserSettingsModalContainer';
import AddProjectModalContainer from '../containers/AddProjectModalContainer';

const App = ({ isUsersModalOpened, isUserSettingsModalOpened, isAddProjectModalOpened }) => (
  <>
    <HeaderContainer />
    <ProjectsContainer />
    {isUsersModalOpened && <UsersModalContainer />}
    {isUserSettingsModalOpened && <UserSettingsModalContainer />}
    {isAddProjectModalOpened && <AddProjectModalContainer />}
  </>
);

App.propTypes = {
  isUsersModalOpened: PropTypes.bool.isRequired,
  isUserSettingsModalOpened: PropTypes.bool.isRequired,
  isAddProjectModalOpened: PropTypes.bool.isRequired,
};

export default App;
