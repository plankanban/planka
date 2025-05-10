/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import BoardMembershipsStep from '../../../board-memberships/BoardMembershipsStep';

const SelectAssigneeStep = React.memo(
  ({ currentUserId, onUserSelect, onUserDeselect, onBack, onClose }) => {
    const deselectUser = useCallback(() => {
      onUserDeselect();
      onClose();
    }, [onUserDeselect, onClose]);

    const handleUserSelect = useCallback(
      (userId) => {
        onUserSelect(userId);
        onClose();
      },
      [onUserSelect, onClose],
    );

    const handleUserDeselect = useCallback(() => {
      deselectUser();
    }, [deselectUser]);

    const handleClear = useCallback(() => {
      deselectUser();
    }, [deselectUser]);

    return (
      <BoardMembershipsStep
        currentUserIds={currentUserId ? [currentUserId] : []}
        title="common.selectAssignee"
        clearButtonContent="action.removeAssignee"
        onUserSelect={handleUserSelect}
        onUserDeselect={handleUserDeselect}
        onClear={handleClear}
        onBack={onBack}
      />
    );
  },
);

SelectAssigneeStep.propTypes = {
  currentUserId: PropTypes.string,
  onUserSelect: PropTypes.func.isRequired,
  onUserDeselect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

SelectAssigneeStep.defaultProps = {
  currentUserId: undefined,
  onBack: undefined,
};

export default SelectAssigneeStep;
