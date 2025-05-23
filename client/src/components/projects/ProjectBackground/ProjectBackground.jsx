/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import { ProjectBackgroundTypes } from '../../../constants/Enums';

import styles from './ProjectBackground.module.scss';
import globalStyles from '../../../styles.module.scss';

const ProjectBackground = React.memo(() => {
  const selectBackgroundImageById = useMemo(() => selectors.makeSelectBackgroundImageById(), []);

  const { backgroundImageId, backgroundType, backgroundGradient } = useSelector(
    selectors.selectCurrentProject,
  );

  const backgroundImageUrl = useSelector((state) => {
    if (!backgroundType || backgroundType !== ProjectBackgroundTypes.IMAGE) {
      return null;
    }

    const backgroundImage = selectBackgroundImageById(state, backgroundImageId);

    if (!backgroundImage) {
      return null;
    }

    return backgroundImage.url;
  });

  return (
    <div
      className={classNames(
        styles.wrapper,
        backgroundType === ProjectBackgroundTypes.GRADIENT &&
          globalStyles[`background${upperFirst(camelCase(backgroundGradient))}`],
      )}
      style={{
        background: backgroundImageUrl && `url("${backgroundImageUrl}") center / cover`,
      }}
    />
  );
});

export default ProjectBackground;
