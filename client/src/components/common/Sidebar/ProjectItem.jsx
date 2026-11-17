/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import Paths from '../../../constants/Paths';
import { ProjectBackgroundTypes } from '../../../constants/Enums';

import styles from './Sidebar.module.scss';
import globalStyles from '../../../styles.module.scss';

const ProjectItem = React.memo(({ id, isActive, isFavorite, onClick }) => {
  const selectProjectById = useMemo(() => selectors.makeSelectProjectById(), []);

  const selectFirstBoardIdByProjectId = useMemo(
    () => selectors.makeSelectFirstBoardIdByProjectId(),
    [],
  );

  const selectNotificationsTotalByProjectId = useMemo(
    () => selectors.makeSelectNotificationsTotalByProjectId(),
    [],
  );

  const project = useSelector((state) => selectProjectById(state, id));
  const firstBoardId = useSelector((state) => selectFirstBoardIdByProjectId(state, id));

  const notificationsTotal = useSelector((state) => selectNotificationsTotalByProjectId(state, id));

  return (
    <Link
      to={
        firstBoardId ? Paths.BOARDS.replace(':id', firstBoardId) : Paths.PROJECTS.replace(':id', id)
      }
      title={project.name}
      className={classNames(styles.item, isActive && styles.itemActive)}
      onClick={onClick}
    >
      {isFavorite ? (
        <Icon fitted name="star" className={classNames(styles.itemIcon, styles.itemIconStar)} />
      ) : (
        <span
          className={classNames(
            styles.projectDot,
            project.backgroundType === ProjectBackgroundTypes.GRADIENT &&
              globalStyles[`background${upperFirst(camelCase(project.backgroundGradient))}`],
          )}
        />
      )}
      <span className={styles.itemName}>{project.name}</span>
      {notificationsTotal > 0 && <span className={styles.badge}>{notificationsTotal}</span>}
    </Link>
  );
});

ProjectItem.propTypes = {
  id: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  isFavorite: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

ProjectItem.defaultProps = {
  isFavorite: false,
};

export default ProjectItem;
