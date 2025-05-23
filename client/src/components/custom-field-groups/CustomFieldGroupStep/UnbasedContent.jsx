/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Button } from 'semantic-ui-react';
import { Input, Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useField, useNestedRef, useSteps } from '../../../hooks';
import DroppableTypes from '../../../constants/DroppableTypes';
import CustomFieldAddStep from './CustomFieldAddStep';
import CustomFieldEditStep from './CustomFieldEditStep';
import CustomField from './CustomField';
import EditCustomFieldGroupStep from '../EditCustomFieldGroupStep';
import ConfirmationStep from '../../common/ConfirmationStep';

import styles from './UnbasedContent.module.scss';

const StepTypes = {
  EDIT: 'EDIT',
  DELETE: 'DELETE',
  ADD_CUSTOM_FIELD: 'ADD_CUSTOM_FIELD',
  EDIT_CUSTOM_FIELD: 'EDIT_CUSTOM_FIELD',
};

const UnbasedContent = React.memo(({ id, onBack }) => {
  const selectCustomFielGroupdById = useMemo(() => selectors.makeSelectCustomFieldGroupById(), []);

  const customFieldGroup = useSelector((state) => selectCustomFielGroupdById(state, id));

  const selectCustomFieldsByGroupId = useMemo(
    () => selectors.makeSelectCustomFieldsByGroupId(),
    [],
  );

  const customFields = useSelector((state) => selectCustomFieldsByGroupId(state, id));

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();
  const [search, handleSearchChange] = useField('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);

  const filteredCustomFields = useMemo(
    () =>
      customFields.filter((customField) => customField.name.toLowerCase().includes(cleanSearch)),
    [customFields, cleanSearch],
  );

  const [searchFieldRef, handleSearchFieldRef] = useNestedRef('inputRef');

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteCustomFieldGroup(id));
  }, [id, dispatch]);

  const handleCustomFieldDragEnd = useCallback(
    ({ draggableId, source, destination }) => {
      if (!destination || source.index === destination.index) {
        return;
      }

      dispatch(entryActions.moveCustomField(draggableId, destination.index));
    },
    [dispatch],
  );

  const handleEditClick = useCallback(() => {
    openStep(StepTypes.EDIT);
  }, [openStep]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  const handleCustomFieldAddClick = useCallback(() => {
    openStep(StepTypes.ADD_CUSTOM_FIELD);
  }, [openStep]);

  const handleCustomFieldEdit = useCallback(
    (customFieldId) => {
      openStep(StepTypes.EDIT_CUSTOM_FIELD, {
        id: customFieldId,
      });
    },
    [openStep],
  );

  useEffect(() => {
    searchFieldRef.current.focus({
      preventScroll: true,
    });
  }, [searchFieldRef]);

  if (step) {
    switch (step.type) {
      case StepTypes.EDIT:
        return <EditCustomFieldGroupStep id={id} onBack={handleBack} onClose={handleBack} />;
      case StepTypes.DELETE:
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
      case StepTypes.ADD_CUSTOM_FIELD:
        return (
          <CustomFieldAddStep
            customFieldGroupId={id}
            // TODO: memoize?
            defaultData={{
              name: search,
            }}
            onBack={handleBack}
          />
        );
      case StepTypes.EDIT_CUSTOM_FIELD: {
        const currentCustomField = customFields.find(
          (customField) => customField.id === step.params.id,
        );

        if (currentCustomField) {
          return <CustomFieldEditStep id={currentCustomField.id} onBack={handleBack} />;
        }

        openStep(null);

        break;
      }
      default:
    }
  }

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.customFieldGroup', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Input
          fluid
          ref={handleSearchFieldRef}
          value={search}
          placeholder={t('common.searchCustomFields')}
          maxLength={128}
          icon="search"
          onChange={handleSearchChange}
        />
        {filteredCustomFields.length > 0 && (
          <DragDropContext onDragEnd={handleCustomFieldDragEnd}>
            <Droppable droppableId="customFields" type={DroppableTypes.CUSTOM_FIELD}>
              {({ innerRef, droppableProps, placeholder }) => (
                <div
                  {...droppableProps} // eslint-disable-line react/jsx-props-no-spreading
                  ref={innerRef}
                  className={styles.items}
                >
                  {filteredCustomFields.map((customField, index) => (
                    <CustomField
                      key={customField.id}
                      id={customField.id}
                      index={index}
                      onEdit={handleCustomFieldEdit}
                    />
                  ))}
                  {placeholder}
                </div>
              )}
            </Droppable>
            <Droppable droppableId="customFields:hack" type={DroppableTypes.CUSTOM_FIELD}>
              {({ innerRef, droppableProps, placeholder }) => (
                <div
                  {...droppableProps} // eslint-disable-line react/jsx-props-no-spreading
                  ref={innerRef}
                  className={styles.droppableHack}
                >
                  {placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
        <Button
          fluid
          content={t('action.addCustomField')}
          className={styles.actionButton}
          onClick={handleCustomFieldAddClick}
        />
        <Button
          fluid
          content={t('action.editGroup')}
          className={styles.actionButton}
          onClick={handleEditClick}
        />
        <Button
          fluid
          content={t('action.deleteGroup')}
          className={styles.actionButton}
          onClick={handleDeleteClick}
        />
      </Popup.Content>
    </>
  );
});

UnbasedContent.propTypes = {
  id: PropTypes.string.isRequired,
  onBack: PropTypes.func,
};

UnbasedContent.defaultProps = {
  onBack: undefined,
};

export default UnbasedContent;
