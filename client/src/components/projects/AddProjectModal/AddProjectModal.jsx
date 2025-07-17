/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, Header, Icon, TextArea } from 'semantic-ui-react';
import { usePopup } from '../../../lib/popup';
import { Input } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useClosableModal, useForm, useNestedRef } from '../../../hooks';
import { isModifierKeyPressed } from '../../../utils/event-helpers';
import { ProjectTypes } from '../../../constants/Enums';
import { ProjectTypeIcons } from '../../../constants/Icons';
import SelectTypeStep from './SelectTypeStep';

import styles from './AddProjectModal.module.scss';

const AddProjectModal = React.memo(() => {
  const defaultType = useSelector(
    (state) => selectors.selectCurrentModal(state).params.defaultType,
  );

  const { data: defaultData, isSubmitting } = useSelector(selectors.selectProjectCreateForm);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [data, handleFieldChange, setData] = useForm(() => ({
    name: '',
    description: '',
    type: ProjectTypes.PRIVATE,
    ...defaultData,
    ...(defaultType && {
      type: defaultType,
    }),
  }));

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
      description: data.description.trim() || null,
    };

    if (!cleanData.name) {
      nameFieldRef.current.select();
      return;
    }

    dispatch(entryActions.createProject(cleanData));
  }, [dispatch, data, nameFieldRef]);

  const handleClose = useCallback(() => {
    dispatch(entryActions.closeModal());
  }, [dispatch]);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleDescriptionKeyDown = useCallback(
    (event) => {
      if (isModifierKeyPressed(event) && event.key === 'Enter') {
        submit();
      }
    },
    [submit],
  );

  const handleTypeSelect = useCallback(
    (type) => {
      setData((prevData) => ({
        ...prevData,
        type,
      }));
    },
    [setData],
  );

  const [ClosableModal, , activateClosable, deactivateClosable] = useClosableModal();

  const handleSelectTypeClose = useCallback(() => {
    deactivateClosable();
    nameFieldRef.current.focus();
  }, [deactivateClosable, nameFieldRef]);

  useEffect(() => {
    nameFieldRef.current.focus();
  }, [nameFieldRef]);

  const SelectTypePopup = usePopup(SelectTypeStep, {
    onOpen: activateClosable,
    onClose: handleSelectTypeClose,
  });

  return (
    <ClosableModal basic closeIcon size="tiny" onClose={handleClose}>
      <ClosableModal.Content>
        <Header inverted size="huge">
          {t('common.createProject', {
            context: 'title',
          })}
        </Header>
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.title')}</div>
          <Input
            fluid
            inverted
            ref={handleNameFieldRef}
            name="name"
            value={data.name}
            maxLength={128}
            readOnly={isSubmitting}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <div className={styles.text}>{t('common.description')}</div>
          <TextArea
            as={TextareaAutosize}
            name="description"
            value={data.description}
            maxLength={1024}
            minRows={2}
            className={styles.field}
            onKeyDown={handleDescriptionKeyDown}
            onChange={handleFieldChange}
          />
          <Button
            inverted
            color="green"
            icon="checkmark"
            content={t('action.createProject')}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
          <SelectTypePopup value={data.type} onSelect={handleTypeSelect}>
            <Button type="button" className={styles.selectTypeButton}>
              <Icon name={ProjectTypeIcons[data.type]} className={styles.selectTypeButtonIcon} />
              {t(`common.${data.type}`)}
            </Button>
          </SelectTypePopup>
        </Form>
      </ClosableModal.Content>
    </ClosableModal>
  );
});

export default AddProjectModal;
