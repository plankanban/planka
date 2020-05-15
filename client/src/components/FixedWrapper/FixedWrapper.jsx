import React from 'react';
import PropTypes from 'prop-types';

import HeaderContainer from '../../containers/HeaderContainer';
import ProjectContainer from '../../containers/ProjectContainer';

import styles from './FixedWrapper.module.css';

const FixedWrapper = ({ projectId }) => (
  <div className={styles.wrapper}>
    <HeaderContainer />
    {projectId && <ProjectContainer />}
  </div>
);

FixedWrapper.propTypes = {
  projectId: PropTypes.string,
};

FixedWrapper.defaultProps = {
  projectId: undefined,
};

export default FixedWrapper;
