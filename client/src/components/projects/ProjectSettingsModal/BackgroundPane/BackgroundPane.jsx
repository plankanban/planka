/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Tab } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { ProjectBackgroundTypes } from '../../../../constants/Enums';
import Gradients from './Gradients';
import Images from './Images';
import AddImageZone from './AddImageZone';

import styles from './BackgroundPane.module.scss';

const TITLE_BY_TYPE = {
  [ProjectBackgroundTypes.GRADIENT]: 'common.gradients',
  [ProjectBackgroundTypes.IMAGE]: 'common.uploadedImages',
};

const BackgroundPane = React.memo(() => {
  const { backgroundType: currentType } = useSelector(selectors.selectCurrentProject);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [activeType, setActiveType] = useState(
    () => currentType || ProjectBackgroundTypes.GRADIENT,
  );

  const handleImageCreate = useCallback(
    (file) => {
      dispatch(
        entryActions.createBackgroundImageInCurrentProject({
          file,
        }),
      );

      setActiveType(ProjectBackgroundTypes.IMAGE);
    },
    [dispatch],
  );

  const handleActiveTypeChange = useCallback((_, { value }) => {
    setActiveType(value);
  }, []);

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <AddImageZone onCreate={handleImageCreate}>
        <Button.Group fluid basic className={styles.activeTypeButtonGroup}>
          {[ProjectBackgroundTypes.GRADIENT, ProjectBackgroundTypes.IMAGE].map((type) => (
            <Button
              key={type}
              type="button"
              value={type}
              active={type === activeType}
              onClick={handleActiveTypeChange}
            >
              {t(TITLE_BY_TYPE[type])}
            </Button>
          ))}
        </Button.Group>
        {activeType === ProjectBackgroundTypes.GRADIENT && <Gradients />}
        {activeType === ProjectBackgroundTypes.IMAGE && <Images />}
      </AddImageZone>
    </Tab.Pane>
  );
});

export default BackgroundPane;
