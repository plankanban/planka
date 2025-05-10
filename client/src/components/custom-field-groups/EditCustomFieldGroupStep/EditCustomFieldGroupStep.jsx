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
import CustomFieldGroupEditor from '../CustomFieldGroupEditor';
import ConfirmationStep from '../../common/ConfirmationStep';

import styles from './EditCustomFieldGroupStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const EditCustomFieldGroupStep = React.memo(({ id, withDeleteButton, onBack, onClose }) => {
  const selectCustomFieldGroupById = useMemo(() => selectors.makeSelectCustomFieldGroupById(), []);

  const customFieldGroup = useSelector((state) => selectCustomFieldGroupById(state, id));

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const defaultData = useMemo(
    () => ({
      name: customFieldGroup.name,
    }),
    [customFieldGroup.name],
  );

  const [data, handleFieldChange] = useForm({
    name: '',
    ...defaultData,
  });

  const [step, openStep, handleBack] = useSteps();

  const customFieldGroupEditorRef = useRef(null);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      customFieldGroupEditorRef.current.selectNameField();
      return;
    }

    if (!dequal(cleanData, defaultData)) {
      dispatch(entryActions.updateCustomFieldGroup(id, cleanData));
    }

    onClose();
  }, [id, onClose, dispatch, defaultData, data, customFieldGroupEditorRef]);

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteCustomFieldGroup(id));
  }, [id, dispatch]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <ConfirmationStep
        title="common.deleteCustomFieldGroup"
        content="common.areYouSureYouWantToDeleteThisCustomFieldGroup"
        buttonContent="action.deleteCustomFieldGroup"
        typeValue={customFieldGroup.boardId ? customFieldGroup.name : undefined}
        typeContent={customFieldGroup.boardId ? 'common.typeTitleToConfirm' : undefined}
        onConfirm={handleDeleteConfirm}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.editCustomFieldGroup', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <CustomFieldGroupEditor data={data} onFieldChange={handleFieldChange} />
          <Button positive content={t('action.save')} />
        </Form>
        {withDeleteButton && (
          <Button
            content={t('action.delete')}
            className={styles.deleteButton}
            onClick={handleDeleteClick}
          />
        )}
      </Popup.Content>
    </>
  );
});

EditCustomFieldGroupStep.propTypes = {
  id: PropTypes.string.isRequired,
  withDeleteButton: PropTypes.bool,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

EditCustomFieldGroupStep.defaultProps = {
  withDeleteButton: false,
  onBack: undefined,
};

export default EditCustomFieldGroupStep;
