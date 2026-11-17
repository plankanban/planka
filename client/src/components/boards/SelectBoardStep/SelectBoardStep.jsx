/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon, Menu } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import { useSteps } from '../../../hooks';
import Item from './Item';
import AddBoardStep from '../AddBoardStep';

import styles from './SelectBoardStep.module.scss';

const StepTypes = {
  ADD: 'ADD',
};

const SelectBoardStep = React.memo(({ onClose }) => {
  const boardIds = useSelector(selectors.selectBoardIdsForCurrentProject);

  const canAdd = useSelector((state) => {
    const isEditModeEnabled = selectors.selectIsEditModeEnabled(state); // TODO: move out?

    if (!isEditModeEnabled) {
      return isEditModeEnabled;
    }

    return selectors.selectIsCurrentUserManagerForCurrentProject(state);
  });

  const [t] = useTranslation();
  const [step, openStep] = useSteps();

  const handleAddClick = useCallback(() => {
    openStep(StepTypes.ADD);
  }, [openStep]);

  if (step && step.type === StepTypes.ADD) {
    return <AddBoardStep onClose={onClose} />;
  }

  return (
    <>
      <Popup.Header>{t('common.selectBoard')}</Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          {boardIds.map((boardId) => (
            <Item key={boardId} id={boardId} onClose={onClose} />
          ))}
          {boardIds.length === 0 && (
            <div className={styles.empty}>{t('common.noBoards')}</div>
          )}
          {canAdd && (
            <Menu.Item className={styles.addItem} onClick={handleAddClick}>
              <Icon name="plus" className={styles.addItemIcon} />
              {t('action.addNewBoard')}
            </Menu.Item>
          )}
        </Menu>
      </Popup.Content>
    </>
  );
});

SelectBoardStep.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default SelectBoardStep;
