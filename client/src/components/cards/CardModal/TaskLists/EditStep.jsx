/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import React, { useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Popup } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { useForm, useSteps } from '../../../../hooks';
import ConfirmationStep from '../../../common/ConfirmationStep';
import TaskListEditor from '../../../task-lists/TaskListEditor';

import styles from './EditStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const EditStep = React.memo(({ taskListId, onClose }) => {
  const selectTaskListById = useMemo(() => selectors.makeSelectTaskListById(), []);

  const taskList = useSelector((state) => selectTaskListById(state, taskListId));

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const defaultData = useMemo(
    () => ({
      name: taskList.name,
      showOnFrontOfCard: taskList.showOnFrontOfCard,
      hideCompletedTasks: taskList.hideCompletedTasks,
    }),
    [taskList.name, taskList.showOnFrontOfCard, taskList.hideCompletedTasks],
  );

  const [data, handleFieldChange] = useForm(() => ({
    name: t('common.taskList', {
      context: 'title',
    }),
    showOnFrontOfCard: true,
    hideCompletedTasks: false,
    ...defaultData,
  }));

  const [step, openStep, handleBack] = useSteps();

  const taskListEditorRef = useRef(null);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      taskListEditorRef.current.selectNameField();
      return;
    }

    if (!dequal(cleanData, defaultData)) {
      dispatch(entryActions.updateTaskList(taskListId, data));
    }

    onClose();
  }, [taskListId, onClose, dispatch, defaultData, data, taskListEditorRef]);

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteTaskList(taskListId));
  }, [taskListId, dispatch]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <ConfirmationStep
        title="common.deleteTaskList"
        content="common.areYouSureYouWantToDeleteThisTaskList"
        buttonContent="action.deleteTaskList"
        onConfirm={handleDeleteConfirm}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <Popup.Header>
        {t('common.taskListActions', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <TaskListEditor ref={taskListEditorRef} data={data} onFieldChange={handleFieldChange} />
          <Button positive content={t('action.save')} />
        </Form>
        <Button
          content={t('action.delete')}
          className={styles.deleteButton}
          onClick={handleDeleteClick}
        />
      </Popup.Content>
    </>
  );
});

EditStep.propTypes = {
  taskListId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditStep;
