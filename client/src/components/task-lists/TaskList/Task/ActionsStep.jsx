/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Menu } from 'semantic-ui-react';
import { Popup } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { useSteps } from '../../../../hooks';
import ConfirmationStep from '../../../common/ConfirmationStep';

import styles from './ActionsStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const ActionsStep = React.memo(({ taskId, onNameEdit, onClose }) => {
  const selectTaskById = useMemo(() => selectors.makeSelectTaskById(), []);

  const task = useSelector((state) => selectTaskById(state, taskId));

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteTask(taskId));
  }, [taskId, dispatch]);

  const handleEditNameClick = useCallback(() => {
    onNameEdit();
    onClose();
  }, [onNameEdit, onClose]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <ConfirmationStep
        title="common.deleteTask"
        content="common.areYouSureYouWantToDeleteThisTask"
        buttonContent="action.deleteTask"
        onConfirm={handleDeleteConfirm}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <Popup.Header>
        {t('common.taskActions', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          {!task.linkedCardId && (
            <Menu.Item className={styles.menuItem} onClick={handleEditNameClick}>
              {t('action.editDescription', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          <Menu.Item className={styles.menuItem} onClick={handleDeleteClick}>
            {t('action.deleteTask', {
              context: 'title',
            })}
          </Menu.Item>
        </Menu>
      </Popup.Content>
    </>
  );
});

ActionsStep.propTypes = {
  taskId: PropTypes.string.isRequired,
  onNameEdit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ActionsStep;
