/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useInView } from 'react-intersection-observer';
import { Comment, Loader } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import Item from './Item';

import styles from './CardActivities.module.scss';

const CardActivities = React.memo(() => {
  const activityIds = useSelector(selectors.selectActivityIdsForCurrentCard);
  const { isActivitiesFetching, isAllActivitiesFetched } = useSelector(selectors.selectCurrentCard);

  const dispatch = useDispatch();

  const [inViewRef] = useInView({
    threshold: 1,
    onChange: (inView) => {
      if (inView) {
        dispatch(entryActions.fetchActivitiesInCurrentCard());
      }
    },
  });

  return (
    <>
      <div className={styles.itemsWrapper}>
        <Comment.Group className={styles.items}>
          {activityIds.map((activityId) => (
            <Item key={activityId} id={activityId} />
          ))}
        </Comment.Group>
      </div>
      {isActivitiesFetching !== undefined && isAllActivitiesFetched !== undefined && (
        <div className={styles.loaderWrapper}>
          {isActivitiesFetching ? (
            <Loader active inverted inline="centered" size="small" />
          ) : (
            !isAllActivitiesFetched && <div ref={inViewRef} />
          )}
        </div>
      )}
    </>
  );
});

export default CardActivities;
