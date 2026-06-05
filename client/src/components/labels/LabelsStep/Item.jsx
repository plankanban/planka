/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';
import { Button } from 'semantic-ui-react';

import selectors from '../../../selectors';
import { BoardMembershipRoles, LabelFilterModes } from '../../../constants/Enums';

import styles from './Item.module.scss';
import globalStyles from '../../../styles.module.scss';

const NEXT_FILTER_MODE_BY_MODE = {
  [LabelFilterModes.NONE]: LabelFilterModes.INCLUDE,
  [LabelFilterModes.INCLUDE]: LabelFilterModes.EXCLUDE,
  [LabelFilterModes.EXCLUDE]: LabelFilterModes.NONE,
};

const Item = React.memo(
  ({
    id,
    index,
    isActive,
    mode,
    isFilterModeEnabled,
    onSelect,
    onDeselect,
    onModeChange,
    onEdit,
  }) => {
    const selectLabelById = useMemo(() => selectors.makeSelectLabelById(), []);

    const label = useSelector((state) => selectLabelById(state, id));

    const canEdit = useSelector((state) => {
      const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
      return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
    });

    const handleToggleClick = useCallback(() => {
      if (label.isPersisted) {
        if (isFilterModeEnabled) {
          onModeChange(id, NEXT_FILTER_MODE_BY_MODE[mode]);
        } else if (isActive) {
          onDeselect(id);
        } else {
          onSelect(id);
        }
      }
    }, [
      id,
      isActive,
      mode,
      isFilterModeEnabled,
      onSelect,
      onDeselect,
      onModeChange,
      label.isPersisted,
    ]);

    const handleEditClick = useCallback(() => {
      onEdit(id);
    }, [id, onEdit]);

    return (
      <Draggable draggableId={id} index={index} isDragDisabled={!label.isPersisted || !canEdit}>
        {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => {
          const contentNode = (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <div {...draggableProps} ref={innerRef} className={styles.wrapper}>
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                         jsx-a11y/no-static-element-interactions */}
              <span
                {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
                className={classNames(
                  styles.name,
                  isFilterModeEnabled && styles.nameFilterMode,
                  ((!isFilterModeEnabled && isActive) || mode === LabelFilterModes.INCLUDE) &&
                    styles.nameActive,
                  mode === LabelFilterModes.EXCLUDE && styles.nameExcluded,
                  globalStyles[`background${upperFirst(camelCase(label.color))}`],
                )}
                onClick={handleToggleClick}
              >
                {label.name}
              </span>
              {canEdit && (
                <Button
                  icon="pencil"
                  size="small"
                  floated="right"
                  disabled={!label.isPersisted}
                  className={styles.editButton}
                  onClick={handleEditClick}
                />
              )}
            </div>
          );

          return isDragging ? ReactDOM.createPortal(contentNode, document.body) : contentNode;
        }}
      </Draggable>
    );
  },
);

Item.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(Object.values(LabelFilterModes)),
  isFilterModeEnabled: PropTypes.bool,
  onSelect: PropTypes.func,
  onDeselect: PropTypes.func,
  onModeChange: PropTypes.func,
  onEdit: PropTypes.func.isRequired,
};

Item.defaultProps = {
  mode: LabelFilterModes.NONE,
  isFilterModeEnabled: false,
  onSelect: undefined,
  onDeselect: undefined,
  onModeChange: undefined,
};

export default Item;
