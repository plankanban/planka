import React from 'react';
import PropTypes from 'prop-types';

import HeaderContainer from '../../containers/HeaderContainer';
import ProjectContainer from '../../containers/ProjectContainer';

import styles from './Fixed.module.scss';

const Fixed = ({ projectId }) => (
  <div className={styles.wrapper}>
    <HeaderContainer />
    {projectId && <ProjectContainer />}
  </div>
);

Fixed.propTypes = {
  projectId: PropTypes.string,
};

Fixed.defaultProps = {
  projectId: undefined,
};

export default Fixed;
