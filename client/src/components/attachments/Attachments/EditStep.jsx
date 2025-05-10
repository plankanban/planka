/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Input, Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, useNestedRef, useSteps } from '../../../hooks';
import ConfirmationStep from '../../common/ConfirmationStep';

import styles from './EditStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const EditStep = React.memo(({ attachmentId, onClose }) => {
  const selectAttachmentById = useMemo(() => selectors.makeSelectAttachmentById(), []);

  const attachment = useSelector((state) => selectAttachmentById(state, attachmentId));

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const defaultData = useMemo(
    () => ({
      name: attachment.name,
    }),
    [attachment.name],
  );

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    ...defaultData,
  }));

  const [step, openStep, handleBack] = useSteps();

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameFieldRef.current.select();
      return;
    }

    if (!dequal(cleanData, defaultData)) {
      dispatch(entryActions.updateAttachment(attachmentId, cleanData));
    }

    onClose();
  }, [attachmentId, onClose, dispatch, defaultData, data, nameFieldRef]);

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteAttachment(attachmentId));
  }, [attachmentId, dispatch]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  useEffect(() => {
    nameFieldRef.current.focus({
      preventScroll: true,
    });
  }, [nameFieldRef]);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <ConfirmationStep
        title="common.deleteAttachment"
        content="common.areYouSureYouWantToDeleteThisAttachment"
        buttonContent="action.deleteAttachment"
        onConfirm={handleDeleteConfirm}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <Popup.Header>
        {t('common.editAttachment', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.title')}</div>
          <Input
            fluid
            ref={handleNameFieldRef}
            name="name"
            value={data.name}
            maxLength={128}
            className={styles.field}
            onChange={handleFieldChange}
          />
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
  attachmentId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditStep;
