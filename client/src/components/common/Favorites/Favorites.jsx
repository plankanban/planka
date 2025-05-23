/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useRef } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import ProjectCard from '../../projects/ProjectCard';

import styles from './Favorites.module.scss';

const Favorites = React.memo(() => {
  const { projectId: currentProjectId } = useSelector(selectors.selectPath);
  const projectIds = useSelector(selectors.selectFavoriteProjectIdsForCurrentUser);
  const isActive = useSelector(selectors.selectIsFavoritesActiveForCurrentUser);

  const cardsRef = useRef(null);

  const handleWheel = useCallback(({ deltaY }) => {
    cardsRef.current.scrollBy({
      left: deltaY,
    });
  }, []);

  return (
    <div
      className={classNames(styles.wrapper, isActive && styles.wrapperActive)}
      onWheel={handleWheel}
    >
      <div ref={cardsRef} className={styles.cards}>
        {projectIds.map((projectId) => (
          <div key={projectId} className={styles.cardWrapper}>
            <ProjectCard
              id={projectId}
              size="small"
              isActive={projectId === currentProjectId}
              className={styles.card}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

export default Favorites;
