/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { Comment, Loader } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useClosableModal } from '../../../hooks';
import Item from './Item';

import styles from './BoardActivitiesModal.module.scss';

const BoardActivitiesModal = React.memo(() => {
  const activityIds = useSelector(selectors.selectActivityIdsForCurrentBoard);

  const { isActivitiesFetching, isAllActivitiesFetched } = useSelector(
    selectors.selectCurrentBoard,
  );

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleClose = useCallback(() => {
    dispatch(entryActions.closeModal());
  }, [dispatch]);

  const [inViewRef] = useInView({
    threshold: 1,
    onChange: (inView) => {
      if (inView) {
        dispatch(entryActions.fetchActivitiesInCurrentBoard());
      }
    },
  });

  const [ClosableModal] = useClosableModal();

  return (
    <ClosableModal closeIcon size="small" centered={false} onClose={handleClose}>
      <ClosableModal.Header>
        {t('common.boardActions', {
          context: 'title',
        })}
      </ClosableModal.Header>
      <ClosableModal.Content>
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
      </ClosableModal.Content>
    </ClosableModal>
  );
});

export default BoardActivitiesModal;
