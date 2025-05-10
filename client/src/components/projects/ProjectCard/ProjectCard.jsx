/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import Paths from '../../../constants/Paths';
import { ProjectBackgroundTypes } from '../../../constants/Enums';
import UserAvatar from '../../users/UserAvatar';

import styles from './ProjectCard.module.scss';
import globalStyles from '../../../styles.module.scss';

const Sizes = {
  SMALL: 'small',
  LARGE: 'large',
};

const ProjectCard = React.memo(
  ({ id, size, isActive, withDescription, withTypeIndicator, withFavoriteButton, className }) => {
    const selectProjectById = useMemo(() => selectors.makeSelectProjectById(), []);

    const selectFirstBoardIdByProjectId = useMemo(
      () => selectors.makeSelectFirstBoardIdByProjectId(),
      [],
    );

    const selectNotificationsTotalByProjectId = useMemo(
      () => selectors.makeSelectNotificationsTotalByProjectId(),
      [],
    );

    const selectProjectManagerById = useMemo(() => selectors.makeSelectProjectManagerById(), []);
    const selectBackgroundImageById = useMemo(() => selectors.makeSelectBackgroundImageById(), []);

    const project = useSelector((state) => selectProjectById(state, id));
    const firstBoardId = useSelector((state) => selectFirstBoardIdByProjectId(state, id));

    const notificationsTotal = useSelector((state) =>
      selectNotificationsTotalByProjectId(state, id),
    );

    const ownerProjectManager = useSelector(
      (state) =>
        project.ownerProjectManagerId &&
        selectProjectManagerById(state, project.ownerProjectManagerId),
    );

    const backgroundImageUrl = useSelector((state) => {
      if (!project.backgroundType || project.backgroundType !== ProjectBackgroundTypes.IMAGE) {
        return null;
      }

      const backgroundImage = selectBackgroundImageById(state, project.backgroundImageId);

      if (!backgroundImage) {
        return null;
      }

      return backgroundImage.thumbnailUrls.outside360;
    });

    const dispatch = useDispatch();

    const handleToggleFavoriteClick = useCallback(() => {
      dispatch(
        entryActions.updateProject(project.id, {
          isFavorite: !project.isFavorite,
        }),
      );
    }, [project, dispatch]);

    const withSidebar = withTypeIndicator || (withFavoriteButton && !project.isHidden);

    return (
      <div
        className={classNames(
          className,
          styles.wrapper,
          styles[`wrapper${upperFirst(size)}`],
          project.isHidden && styles.wrapperHidden,
        )}
      >
        <Link
          to={
            firstBoardId
              ? Paths.BOARDS.replace(':id', firstBoardId)
              : Paths.PROJECTS.replace(':id', id)
          }
          className={styles.content}
        >
          <div
            className={classNames(
              styles.cover,
              project.backgroundType === ProjectBackgroundTypes.GRADIENT &&
                globalStyles[`background${upperFirst(camelCase(project.backgroundGradient))}`],
            )}
            style={{
              background: backgroundImageUrl && `url("${backgroundImageUrl}") center / cover`,
            }}
          />
          {notificationsTotal > 0 && (
            <span className={styles.notifications}>{notificationsTotal}</span>
          )}
          <div
            className={classNames(styles.information, withSidebar && styles.informationWithSidebar)}
          >
            <div
              className={classNames(
                styles.title,
                isActive !== undefined && styles.titleActivatable,
                isActive && styles.titleActive,
              )}
            >
              {project.name}
            </div>
            {withDescription && project.description && (
              <div className={styles.description}>{project.description}</div>
            )}
          </div>
          {withTypeIndicator && (
            <div
              className={classNames(
                styles.typeIndicator,
                ownerProjectManager && styles.typeIndicatorWithUser,
              )}
            >
              {ownerProjectManager ? (
                <UserAvatar id={ownerProjectManager.userId} size="small" />
              ) : (
                <Icon
                  fitted
                  name="group"
                  className={classNames(styles.icon, styles.typeIndicatorIcon)}
                />
              )}
            </div>
          )}
        </Link>
        {withFavoriteButton && !project.isHidden && (
          <Button
            className={classNames(
              styles.favoriteButton,
              !project.isFavorite && styles.favoriteButtonAppearable,
            )}
            onClick={handleToggleFavoriteClick}
          >
            <Icon
              fitted
              name={project.isFavorite ? 'star' : 'star outline'}
              className={classNames(styles.icon, styles.favoriteButtonIcon)}
            />
          </Button>
        )}
      </div>
    );
  },
);

ProjectCard.propTypes = {
  id: PropTypes.string.isRequired,
  size: PropTypes.oneOf(Object.values(Sizes)),
  isActive: PropTypes.bool,
  withDescription: PropTypes.bool,
  withTypeIndicator: PropTypes.bool,
  withFavoriteButton: PropTypes.bool,
  className: PropTypes.string.isRequired,
};

ProjectCard.defaultProps = {
  size: Sizes.LARGE,
  isActive: undefined,
  withDescription: false,
  withTypeIndicator: false,
  withFavoriteButton: false,
};

export default ProjectCard;
