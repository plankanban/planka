/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';
import { Input, Popup, Tooltip } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useField, useNestedRef, useSteps } from '../../../hooks';
import DroppableTypes from '../../../constants/DroppableTypes';
import { BoardMembershipRoles, LabelFilterModes } from '../../../constants/Enums';
import Item from './Item';
import AddStep from './AddStep';
import EditStep from './EditStep';

import styles from './LabelsStep.module.scss';
import globalStyles from '../../../styles.module.scss';

const StepTypes = {
  ADD: 'ADD',
  EDIT: 'EDIT',
};

// Two view modes:
//   • LIST  — full row per label (drag handle + chip + edit button). The
//             original / default. Used for management: reorder, edit, delete.
//   • CHIPS — compact grid of just the coloured chips, flex-wrapping onto
//             several rows. Unchecked chips are dimmed so the assigned ones
//             pop by contrast. No edit / drag affordances — this view is for
//             quick toggling only.
const ViewModes = {
  LIST: 'LIST',
  CHIPS: 'CHIPS',
};

// The preference outlives the popup (which remounts on every open) and the
// browser session, so it lives in localStorage rather than in the store. The
// `plankaLabels` namespace keeps it clear of any other module's keys.
const VIEW_MODE_STORAGE_KEY = 'plankaLabels.viewMode';

const loadViewMode = () => {
  try {
    const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return stored === ViewModes.CHIPS ? ViewModes.CHIPS : ViewModes.LIST;
  } catch {
    // Private-mode browsers and blocked site data throw on access, so fall
    // back to the mode the popup has always opened in.
    return ViewModes.LIST;
  }
};

const persistViewMode = (mode) => {
  try {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  } catch {
    // Storage disabled / full — the current session still remembers via state.
  }
};

const LabelsStep = React.memo(
  ({
    currentIds,
    currentModes,
    isFilterModeEnabled,
    cardId,
    title,
    onSelect,
    onDeselect,
    onModeChange,
    onBack,
  }) => {
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

    // Lazy initializer so the read happens once per mount, not on every render.
    const [viewMode, setViewMode] = useState(loadViewMode);

    // The chip grid has no room for the three-state include/exclude cycle, so
    // the filter popup stays on the list and never offers the switch.
    const canSwitchViewMode = !isFilterModeEnabled;
    const isChipsView = canSwitchViewMode && viewMode === ViewModes.CHIPS;

    const handleToggleViewMode = useCallback(() => {
      setViewMode((prevViewMode) => {
        const nextViewMode = prevViewMode === ViewModes.LIST ? ViewModes.CHIPS : ViewModes.LIST;
        persistViewMode(nextViewMode);

        return nextViewMode;
      });
    }, []);

    // The same toggle `Item` performs, but against the plain label objects the
    // board selector hands out. Those lack the Redux-ORM `isPersisted` getter
    // that `Item` sees through `selectLabelById`, so `!label.isPersisted` would
    // reject every chip. Test for an explicit `false` instead: a genuinely
    // unsaved label is still blocked, an undefined one still clicks.
    const handleChipToggle = useCallback(
      (label) => {
        if (label.isPersisted === false) {
          return;
        }

        if (currentIds.includes(label.id)) {
          onDeselect(label.id);
        } else {
          onSelect(label.id);
        }
      },
      [currentIds, onSelect, onDeselect],
    );

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

    const viewModeHint = isChipsView ? t('common.showAsList') : t('common.showAsChips');

    return (
      <>
        <Popup.Header onBack={onBack}>
          {t(title, {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content>
          <div className={styles.searchRow}>
            <Input
              fluid
              ref={handleSearchFieldRef}
              value={search}
              placeholder={t('common.searchLabels')}
              maxLength={128}
              icon="search"
              className={styles.searchField}
              onChange={handleSearchChange}
            />
            {/* The glyph shows what the click will give you, not what you are
            looking at: `th large` while the list shows, `list` while the chips
            do. */}
            {canSwitchViewMode && (
              <Tooltip content={viewModeHint}>
                <button
                  type="button"
                  aria-label={viewModeHint}
                  className={styles.viewModeButton}
                  onClick={handleToggleViewMode}
                >
                  <Icon fitted name={isChipsView ? 'list' : 'th large'} />
                </button>
              </Tooltip>
            )}
          </div>
          {filteredLabels.length > 0 && !isChipsView && (
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
                        mode={currentModes[item.id] || LabelFilterModes.NONE}
                        isFilterModeEnabled={isFilterModeEnabled}
                        onSelect={onSelect}
                        onDeselect={onDeselect}
                        onModeChange={onModeChange}
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
          {/* `data-popup-wide-grid` widens the popup wrapper (Popup.module.css)
          for as long as the grid is on screen, so a few chips fit per row. A
          <span> rather than a <button> because the popup portal swallows some
          button click chains — the same reason Item.jsx clicks a span. */}
          {filteredLabels.length > 0 && isChipsView && (
            <div className={styles.chipGrid} data-popup-wide-grid>
              {filteredLabels.map((item) => (
                /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                            jsx-a11y/no-static-element-interactions */
                <span
                  key={item.id}
                  data-label-id={item.id}
                  className={classNames(
                    styles.chip,
                    currentIds.includes(item.id) ? styles.chipActive : styles.chipInactive,
                    globalStyles[`background${upperFirst(camelCase(item.color))}`],
                  )}
                  onClick={() => handleChipToggle(item)}
                >
                  {item.name || item.color}
                </span>
              ))}
            </div>
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
  },
);

LabelsStep.propTypes = {
  currentIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentModes: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  isFilterModeEnabled: PropTypes.bool,
  cardId: PropTypes.string,
  title: PropTypes.string,
  onSelect: PropTypes.func,
  onDeselect: PropTypes.func,
  onModeChange: PropTypes.func,
  onBack: PropTypes.func,
};

LabelsStep.defaultProps = {
  currentModes: {},
  isFilterModeEnabled: false,
  cardId: undefined,
  title: 'common.labels',
  onSelect: undefined,
  onDeselect: undefined,
  onModeChange: undefined,
  onBack: undefined,
};

export default LabelsStep;
