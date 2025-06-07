/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, useSteps } from '../../../hooks';
import LABEL_COLORS from '../../../constants/LabelColors';
import Editor from './Editor';
import ConfirmationStep from '../../common/ConfirmationStep';

import styles from './EditStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const EditStep = React.memo(({ labelId, onBack }) => {
  const selectLabelById = useMemo(() => selectors.makeSelectLabelById(), []);

  const label = useSelector((state) => selectLabelById(state, labelId));

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const defaultData = useMemo(
    () => ({
      name: label.name,
      color: label.color,
    }),
    [label.name, label.color],
  );

  const [data, handleFieldChange] = useForm(() => ({
    color: LABEL_COLORS[0],
    ...defaultData,
    name: defaultData.name || '',
  }));

  const [step, openStep, handleBack] = useSteps();

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim() || null,
    };

    if (!dequal(cleanData, defaultData)) {
      dispatch(entryActions.updateLabel(labelId, cleanData));
    }

    onBack();
  }, [labelId, onBack, defaultData, dispatch, data]);

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteLabel(labelId));
  }, [labelId, dispatch]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <ConfirmationStep
        title="common.deleteLabel"
        content="common.areYouSureYouWantToDeleteThisLabel"
        buttonContent="action.deleteLabel"
        onConfirm={handleDeleteConfirm}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.editLabel', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <Editor data={data} onFieldChange={handleFieldChange} />
          <div className={styles.actions}>
            <Button positive content={t('action.save')} />
            <Button
              type="button"
              content={t('action.delete')}
              className={styles.deleteButton}
              onClick={handleDeleteClick}
            />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

EditStep.propTypes = {
  labelId: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default EditStep;
