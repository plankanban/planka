import React from 'react';
import PropTypes from 'prop-types';

import ModalTypes from '../constants/ModalTypes';
import FixedContainer from '../containers/FixedContainer';
import StaticContainer from '../containers/StaticContainer';
import UsersModalContainer from '../containers/UsersModalContainer';
import UserSettingsModalContainer from '../containers/UserSettingsModalContainer';
import ProjectAddModalContainer from '../containers/ProjectAddModalContainer';
import Background from './Background';

const Core = ({ currentModal, currentProject }) => (
  <>
    {currentProject && currentProject.background && (
      <Background
        type={currentProject.background.type}
        name={currentProject.background.name}
        imageUrl={currentProject.backgroundImage && currentProject.backgroundImage.url}
      />
    )}
    <FixedContainer />
    <StaticContainer />
    {currentModal === ModalTypes.USERS && <UsersModalContainer />}
    {currentModal === ModalTypes.USER_SETTINGS && <UserSettingsModalContainer />}
    {currentModal === ModalTypes.PROJECT_ADD && <ProjectAddModalContainer />}
  </>
);

Core.propTypes = {
  currentModal: PropTypes.oneOf(Object.values(ModalTypes)),
  currentProject: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

Core.defaultProps = {
  currentModal: undefined,
  currentProject: undefined,
};

export default Core;
