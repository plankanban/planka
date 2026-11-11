/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Loader, Tab } from 'semantic-ui-react';
import { FilePicker } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import Image from '../BackgroundPane/Image';

import styles from './ThumbnailPane.module.scss';

const Item = React.memo(({ id }) => {
  const selectBackgroundImageById = useMemo(() => selectors.makeSelectBackgroundImageById(), []);

  const backgroundImage = useSelector((state) => selectBackgroundImageById(state, id));

  const isActive = useSelector(
    (state) => id === selectors.selectCurrentProject(state).homeThumbnailImageId,
  );

  const dispatch = useDispatch();

  const handleSelect = useCallback(() => {
    dispatch(entryActions.updateCurrentProject({ homeThumbnailImageId: id }));
  }, [id, dispatch]);

  const handleDeselect = useCallback(() => {
    dispatch(entryActions.updateCurrentProject({ homeThumbnailImageId: null }));
  }, [dispatch]);

  const handleDelete = useCallback(() => {
    dispatch(entryActions.deleteBackgroundImage(id));
  }, [id, dispatch]);

  if (!backgroundImage.isPersisted) {
    return (
      <div className={styles.wrapperSubmitting}>
        <Loader inverted />
      </div>
    );
  }

  return (
    <Image
      url={backgroundImage.thumbnailUrls.outside360}
      isActive={isActive}
      onSelect={handleSelect}
      onDeselect={handleDeselect}
      onDelete={handleDelete}
    />
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
};

const ThumbnailPane = React.memo(() => {
  const backgroundImageIds = useSelector(selectors.selectBackgroundImageIdsForCurrentProject);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleFileSelect = useCallback(
    (file) => {
      dispatch(entryActions.createBackgroundImageInCurrentProject({ file, purpose: 'homeThumbnail' }));
    },
    [dispatch],
  );

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <p className={styles.hint}>{t('common.homeThumbnailHint')}</p>
      <div className={styles.images}>
        {backgroundImageIds.map((backgroundImageId) => (
          <Item key={backgroundImageId} id={backgroundImageId} />
        ))}
      </div>
      <div className={styles.actions}>
        <FilePicker accept="image/*" onSelect={handleFileSelect}>
          <Button
            content={t('action.uploadNewImage', {
              context: 'title',
            })}
            className={styles.actionButton}
          />
        </FilePicker>
      </div>
    </Tab.Pane>
  );
});

export default ThumbnailPane;
