/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { usePopup } from '../../../../lib/popup';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { HomeViews } from '../../../../constants/Enums';
import { HomeViewIcons, ProjectOrderIcons } from '../../../../constants/Icons';
import SelectOrderStep from './SelectOrderStep';

import styles from './RightSide.module.scss';

const RightSide = React.memo(() => {
  const currentView = useSelector(selectors.selectHomeView); // TODO: rename?
  const currentOrder = useSelector(selectors.selectProjectsOrder); // TODO: rename?
  const isHiddenVisible = useSelector(selectors.selectIsHiddenProjectsVisible);

  const dispatch = useDispatch();

  const handleSelectViewClick = useCallback(
    ({ currentTarget: { value: view } }) => {
      dispatch(entryActions.updateHomeView(view));
    },
    [dispatch],
  );

  const handleOrderSelect = useCallback(
    (order) => {
      dispatch(entryActions.updateProjectsOrder(order));
    },
    [dispatch],
  );

  const handleToggleHiddenClick = useCallback(() => {
    dispatch(entryActions.toggleHiddenProjects(!isHiddenVisible));
  }, [isHiddenVisible, dispatch]);

  const SelectOrderPopup = usePopup(SelectOrderStep);

  return (
    <>
      <div className={styles.action}>
        <button
          type="button"
          className={classNames(styles.button)}
          onClick={handleToggleHiddenClick}
        >
          <Icon fitted name={isHiddenVisible ? 'eye slash' : 'eye'} />
        </button>
      </div>
      <div className={styles.action}>
        <SelectOrderPopup value={currentOrder} onSelect={handleOrderSelect}>
          <button type="button" className={styles.button}>
            <Icon fitted name={ProjectOrderIcons[currentOrder]} />
          </button>
        </SelectOrderPopup>
      </div>
      <div className={styles.action}>
        <div className={styles.buttonGroup}>
          {[HomeViews.GRID_PROJECTS, HomeViews.GROUPED_PROJECTS].map((view) => (
            <button
              key={view}
              type="button"
              value={view}
              disabled={view === currentView}
              className={styles.button}
              onClick={handleSelectViewClick}
            >
              <Icon fitted name={HomeViewIcons[view]} />
            </button>
          ))}
        </div>
      </div>
    </>
  );
});

export default RightSide;
