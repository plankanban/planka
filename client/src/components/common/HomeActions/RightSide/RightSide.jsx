/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';
import { Tooltip } from '../../../../lib/custom-ui';
import { usePopup } from '../../../../lib/popup';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { HomeViews } from '../../../../constants/Enums';
import { HomeViewIcons, ProjectOrderIcons } from '../../../../constants/Icons';
import SelectOrderStep from './SelectOrderStep';

import styles from './RightSide.module.scss';

const LABEL_BY_VIEW = {
  [HomeViews.GRID_PROJECTS]: 'common.gridProjects',
  [HomeViews.GROUPED_PROJECTS]: 'common.groupedProjects',
};

const RightSide = React.memo(() => {
  const currentView = useSelector(selectors.selectHomeView); // TODO: rename?
  const currentOrder = useSelector(selectors.selectProjectsOrder); // TODO: rename?
  const isHiddenVisible = useSelector(selectors.selectIsHiddenProjectsVisible);

  const dispatch = useDispatch();
  const [t] = useTranslation();

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
        <Tooltip
          content={t(isHiddenVisible ? 'action.hideHiddenProjects' : 'common.showHiddenProjects')}
        >
          <button
            type="button"
            className={classNames(styles.button)}
            onClick={handleToggleHiddenClick}
          >
            <Icon fitted name={isHiddenVisible ? 'eye slash' : 'eye'} />
          </button>
        </Tooltip>
      </div>
      <div className={styles.action}>
        <SelectOrderPopup value={currentOrder} onSelect={handleOrderSelect}>
          <Tooltip content={t('common.selectOrder', { context: 'title' })}>
            <button type="button" className={styles.button}>
              <Icon fitted name={ProjectOrderIcons[currentOrder]} />
            </button>
          </Tooltip>
        </SelectOrderPopup>
      </div>
      <div className={styles.action}>
        <div className={styles.buttonGroup}>
          {[HomeViews.GRID_PROJECTS, HomeViews.GROUPED_PROJECTS].map((view) => (
            <Tooltip
              key={view}
              content={t('action.switchToView', {
                view: t(LABEL_BY_VIEW[view]),
              })}
              disabled={view === currentView}
            >
              <button
                type="button"
                value={view}
                disabled={view === currentView}
                className={styles.button}
                onClick={handleSelectViewClick}
              >
                <Icon fitted name={HomeViewIcons[view]} />
              </button>
            </Tooltip>
          ))}
        </div>
      </div>
    </>
  );
});

export default RightSide;
