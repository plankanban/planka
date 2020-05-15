import React from 'react';
import PropTypes from 'prop-types';

import ModalTypes from '../constants/ModalTypes';
import FixedWrapperContainer from '../containers/FixedWrapperContainer';
import StaticWrapperContainer from '../containers/StaticWrapperContainer';
import UsersModalContainer from '../containers/UsersModalContainer';
import UserSettingsModalContainer from '../containers/UserSettingsModalContainer';
import AddProjectModalContainer from '../containers/AddProjectModalContainer';

const App = ({ currentModal }) => (
  <>
    <FixedWrapperContainer />
    <StaticWrapperContainer />
    {currentModal === ModalTypes.USERS && <UsersModalContainer />}
    {currentModal === ModalTypes.USER_SETTINGS && <UserSettingsModalContainer />}
    {currentModal === ModalTypes.ADD_PROJECT && <AddProjectModalContainer />}
  </>
);

App.propTypes = {
  currentModal: PropTypes.oneOf(Object.values(ModalTypes)),
};

App.defaultProps = {
  currentModal: undefined,
};

export default App;
