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
import { BoardMembershipRoles } from '../../../constants/Enums';
import Item from './Item';
import AddStep from './AddStep';
import EditStep from './EditStep';

import styles from './LabelsStep.module.scss';
import globalStyles from '../../../styles.module.scss';

const StepTypes = {
  ADD: 'ADD',
  EDIT: 'EDIT',
};

const LabelsStep = React.memo(({ currentIds, cardId, title, onSelect, onDeselect, onBack }) => {
  const labels = useSelector(selectors.selectLabelsForCurrentBoard);

  const canAdd = useSelector((state) => {
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
  });

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();
  const [search, handleSearchChange] = useField('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);

  const filteredLabels = useMemo(
    () =>
      labels.filter(
        (label) =>
          (label.name && label.name.toLowerCase().includes(cleanSearch)) ||
          label.color.includes(cleanSearch),
      ),
    [labels, cleanSearch],
  );

  const [searchFieldRef, handleSearchFieldRef] = useNestedRef('inputRef');

  const handleDragStart = useCallback(() => {
    document.body.classList.add(globalStyles.dragging);
  }, []);

  const handleDragEnd = useCallback(
    ({ draggableId, source, destination }) => {
      document.body.classList.remove(globalStyles.dragging);

      if (!destination || source.index === destination.index) {
        return;
      }

      dispatch(entryActions.moveLabel(draggableId, destination.index));
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
          <AddStep
            cardId={cardId}
            // TODO: memoize?
            defaultData={{
              name: search,
            }}
            onBack={handleBack}
          />
        );
      case StepTypes.EDIT: {
        const currentLabel = labels.find((label) => label.id === step.params.id);

        if (currentLabel) {
          return <EditStep labelId={currentLabel.id} onBack={handleBack} />;
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
        {t(title, {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Input
          fluid
          ref={handleSearchFieldRef}
          value={search}
          placeholder={t('common.searchLabels')}
          maxLength={128}
          icon="search"
          onChange={handleSearchChange}
        />
        {filteredLabels.length > 0 && (
          <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Droppable droppableId="labels" type={DroppableTypes.LABEL}>
              {({ innerRef, droppableProps, placeholder }) => (
                <div
                  {...droppableProps} // eslint-disable-line react/jsx-props-no-spreading
                  ref={innerRef}
                  className={styles.items}
                >
                  {filteredLabels.map((item, index) => (
                    <Item
                      key={item.id}
                      id={item.id}
                      index={index}
                      isActive={currentIds.includes(item.id)}
                      onSelect={onSelect}
                      onDeselect={onDeselect}
                      onEdit={handleEdit}
                    />
                  ))}
                  {placeholder}
                </div>
              )}
            </Droppable>
            <Droppable droppableId="labels:hack" type={DroppableTypes.LABEL}>
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
        {canAdd && (
          <Button
            fluid
            content={t('action.createNewLabel')}
            className={styles.addButton}
            onClick={handleAddClick}
          />
        )}
      </Popup.Content>
    </>
  );
});

LabelsStep.propTypes = {
  currentIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  cardId: PropTypes.string,
  title: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

LabelsStep.defaultProps = {
  cardId: undefined,
  title: 'common.labels',
  onBack: undefined,
};

export default LabelsStep;
