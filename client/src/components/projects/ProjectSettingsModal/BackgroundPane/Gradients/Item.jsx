/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Label } from 'semantic-ui-react';

import selectors from '../../../../../selectors';
import entryActions from '../../../../../entry-actions';
import { ProjectBackgroundTypes } from '../../../../../constants/Enums';

import styles from './Item.module.scss';
import globalStyles from '../../../../../styles.module.scss';

const Item = React.memo(({ name }) => {
  const isActive = useSelector((state) => {
    const { backgroundType, backgroundGradient } = selectors.selectCurrentProject(state);
    return backgroundType === ProjectBackgroundTypes.GRADIENT && name === backgroundGradient;
  });

  const dispatch = useDispatch();

  const handleClick = useCallback(() => {
    dispatch(
      entryActions.updateCurrentProject(
        isActive
          ? {
              backgroundType: null,
              backgroundGradient: null,
            }
          : {
              backgroundType: ProjectBackgroundTypes.GRADIENT,
              backgroundGradient: name,
            },
      ),
    );
  }, [name, isActive, dispatch]);

  return (
    <Button
      type="button"
      className={classNames(
        styles.wrapper,
        globalStyles[`background${upperFirst(camelCase(name))}`],
      )}
      onClick={handleClick}
    >
      {isActive && (
        <Label
          corner="left"
          size="mini"
          icon={{
            name: 'checkmark',
            color: 'grey',
            inverted: true,
          }}
          className={styles.label}
        />
      )}
    </Button>
  );
});

Item.propTypes = {
  name: PropTypes.string.isRequired,
};

export default Item;
