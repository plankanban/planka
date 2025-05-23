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
import Item from './Item';
import CustomFieldGroupStep from '../CustomFieldGroupStep';
import AddCustomFieldGroupStep from '../AddCustomFieldGroupStep';

import styles from './CustomFieldGroupsStep.module.scss';

const StepTypes = {
  ADD: 'ADD',
  EDIT: 'EDIT',
};

const CustomFieldGroupsStep = React.memo(({ onBack }) => {
  const customFieldGroups = useSelector(selectors.selectCustomFieldGroupsForCurrentBoard);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();
  const [search, handleSearchChange] = useField('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);

  const filteredCustomFieldGroups = useMemo(
    () =>
      customFieldGroups.filter((customFieldGroup) =>
        customFieldGroup.name.toLowerCase().includes(cleanSearch),
      ),
    [customFieldGroups, cleanSearch],
  );

  const [searchFieldRef, handleSearchFieldRef] = useNestedRef('inputRef');

  const handleCreate = useCallback(
    (data) => {
      dispatch(entryActions.createCustomFieldGroupInCurrentBoard(data));
    },
    [dispatch],
  );

  const handleDragEnd = useCallback(
    ({ draggableId, source, destination }) => {
      if (!destination || source.index === destination.index) {
        return;
      }

      dispatch(entryActions.moveCustomFieldGroup(draggableId, destination.index));
    },
    [dispatch],
  );

  const handleAddClick = useCallback(() => {
    openStep(StepTypes.ADD);
  }, [openStep]);

  const handleEdit = useCallback(
    (id) => {
      openStep(StepTypes.EDIT, {
        id,
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
      case StepTypes.ADD:
        return (
          <AddCustomFieldGroupStep
            onCreate={handleCreate}
            onBack={handleBack}
            onClose={handleBack}
          />
        );
      case StepTypes.EDIT: {
        const currentCustomFieldGroup = customFieldGroups.find(
          (customFieldGroup) => customFieldGroup.id === step.params.id,
        );

        if (currentCustomFieldGroup) {
          return (
            <CustomFieldGroupStep
              id={currentCustomFieldGroup.id}
              onBack={handleBack}
              onClose={handleBack}
            />
          );
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
        {t('common.customFieldGroups', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Input
          fluid
          ref={handleSearchFieldRef}
          value={search}
          placeholder={t('common.searchCustomFieldGroups')}
          maxLength={128}
          icon="search"
          onChange={handleSearchChange}
        />
        {filteredCustomFieldGroups.length > 0 && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="customFieldGroups" type={DroppableTypes.CUSTOM_FIELD_GROUP}>
              {({ innerRef, droppableProps, placeholder }) => (
                <div
                  {...droppableProps} // eslint-disable-line react/jsx-props-no-spreading
                  ref={innerRef}
                  className={styles.items}
                >
                  {filteredCustomFieldGroups.map((customFieldGroup, index) => (
                    <Item
                      key={customFieldGroup.id}
                      id={customFieldGroup.id}
                      index={index}
                      onEdit={handleEdit}
                    />
                  ))}
                  {placeholder}
                </div>
              )}
            </Droppable>
            <Droppable
              droppableId="customFieldGroups:hack"
              type={DroppableTypes.CUSTOM_FIELD_GROUP}
            >
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
          content={t('action.addCustomFieldGroup')}
          className={styles.actionButton}
          onClick={handleAddClick}
        />
      </Popup.Content>
    </>
  );
});

CustomFieldGroupsStep.propTypes = {
  onBack: PropTypes.func,
};

CustomFieldGroupsStep.defaultProps = {
  onBack: undefined,
};

export default CustomFieldGroupsStep;
