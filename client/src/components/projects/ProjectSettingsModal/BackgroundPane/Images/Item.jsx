/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from 'semantic-ui-react';

import selectors from '../../../../../selectors';
import entryActions from '../../../../../entry-actions';
import { ProjectBackgroundTypes } from '../../../../../constants/Enums';
import Image from '../Image';

import styles from './Item.module.scss';

const Item = React.memo(({ id }) => {
  const selectBackgroundImageById = useMemo(() => selectors.makeSelectBackgroundImageById(), []);

  const backgroundImage = useSelector((state) => selectBackgroundImageById(state, id));

  const isActive = useSelector((state) => {
    const { backgroundType, backgroundImageId } = selectors.selectCurrentProject(state);
    return backgroundType === ProjectBackgroundTypes.IMAGE && id === backgroundImageId;
  });

  const dispatch = useDispatch();

  const handleSelect = useCallback(() => {
    dispatch(
      entryActions.updateCurrentProject({
        backgroundType: ProjectBackgroundTypes.IMAGE,
        backgroundImageId: id,
      }),
    );
  }, [id, dispatch]);

  const handleDeselect = useCallback(() => {
    dispatch(
      entryActions.updateCurrentProject({
        backgroundType: null,
        backgroundImageId: null,
      }),
    );
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

export default Item;
