import React from 'react';
import PropTypes from 'prop-types';

import BoardsContainer from '../../containers/BoardsContainer';
import ProjectSettingsModalContainer from '../../containers/ProjectSettingsModalContainer';

import styles from './Project.module.scss';

const Project = React.memo(({ isSettingsModalOpened }) => {
  return (
    <>
      <div className={styles.wrapper}>
        <BoardsContainer />
      </div>
      {isSettingsModalOpened && <ProjectSettingsModalContainer />}
    </>
  );
});

Project.propTypes = {
  isSettingsModalOpened: PropTypes.bool.isRequired,
};

export default Project;
