/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { FilePicker } from '../../../../../lib/custom-ui';

import selectors from '../../../../../selectors';
import entryActions from '../../../../../entry-actions';
import Item from './Item';

import styles from './Images.module.scss';

const Images = React.memo(() => {
  const backgroundImageIds = useSelector(selectors.selectBackgroundImageIdsForCurrentProject);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const fieldRef = useRef(null);

  const handleFileSelect = useCallback(
    (file) => {
      dispatch(
        entryActions.createBackgroundImageInCurrentProject({
          file,
        }),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    fieldRef.current.focus();
  }, []);

  return (
    <>
      <div className={styles.images}>
        {backgroundImageIds.map((backgroundImageId) => (
          <Item key={backgroundImageId} id={backgroundImageId} />
        ))}
      </div>
      <div className={styles.actions}>
        <div className={styles.action}>
          <FilePicker accept="image/*" onSelect={handleFileSelect}>
            <Button
              ref={fieldRef}
              content={t('action.uploadNewImage', {
                context: 'title',
              })}
              className={styles.actionButton}
            />
          </FilePicker>
        </div>
      </div>
    </>
  );
});

export default Images;
