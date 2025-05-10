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
import { Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, useSteps } from '../../../hooks';
import CustomFieldEditor from './CustomFieldEditor';
import ConfirmationStep from '../../common/ConfirmationStep';

import styles from './CustomFieldEditStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const CustomFieldEditStep = React.memo(({ id, onBack }) => {
  const selectCustomFieldById = useMemo(() => selectors.makeSelectCustomFieldById(), []);

  const customField = useSelector((state) => selectCustomFieldById(state, id));

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const defaultData = useMemo(
    () => ({
      name: customField.name,
      showOnFrontOfCard: customField.showOnFrontOfCard,
    }),
    [customField.name, customField.showOnFrontOfCard],
  );

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    showOnFrontOfCard: false,
    ...defaultData,
  }));

  const [step, openStep, handleBack] = useSteps();

  const customFieldEditorRef = useRef(null);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim() || null,
    };

    if (!cleanData.name) {
      customFieldEditorRef.current.selectNameField();
      return;
    }

    if (!dequal(cleanData, defaultData)) {
      dispatch(entryActions.updateCustomField(id, cleanData));
    }

    onBack();
  }, [id, onBack, dispatch, defaultData, data]);

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteCustomField(id));
    onBack();
  }, [id, onBack, dispatch]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <ConfirmationStep
        title="common.deleteCustomField"
        content="common.areYouSureYouWantToDeleteThisCustomField"
        buttonContent="action.deleteCustomField"
        onConfirm={handleDeleteConfirm}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.editCustomField', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <CustomFieldEditor
            ref={customFieldEditorRef}
            data={data}
            onFieldChange={handleFieldChange}
          />
          <Button positive content={t('action.save')} className={styles.submitButton} />
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

CustomFieldEditStep.propTypes = {
  id: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default CustomFieldEditStep;
