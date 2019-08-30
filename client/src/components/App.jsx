import React from 'react';
import PropTypes from 'prop-types';

import HeaderContainer from '../containers/HeaderContainer';
import ProjectsContainer from '../containers/ProjectsContainer';
import UsersModalContainer from '../containers/UsersModalContainer';
import AddProjectModalContainer from '../containers/AddProjectModalContainer';

const App = ({ isUsersModalOpened, isAddProjectModalOpened }) => (
  <>
    <HeaderContainer />
    <ProjectsContainer />
    {isUsersModalOpened && <UsersModalContainer />}
    {isAddProjectModalOpened && <AddProjectModalContainer />}
  </>
);

App.propTypes = {
  isUsersModalOpened: PropTypes.bool.isRequired,
  isAddProjectModalOpened: PropTypes.bool.isRequired,
};

export default App;
