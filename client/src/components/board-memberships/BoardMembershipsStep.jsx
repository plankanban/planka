/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import selectors from '../../selectors';
import PureBoardMembershipsStep from './PureBoardMembershipsStep';

const BoardMembershipsStep = React.memo(
  ({
    currentUserIds,
    title,
    clearButtonContent,
    onUserSelect,
    onUserDeselect,
    onClear,
    onBack,
  }) => {
    const boardMemberships = useSelector(selectors.selectMembershipsForCurrentBoard);

    return (
      <PureBoardMembershipsStep
        items={boardMemberships}
        currentUserIds={currentUserIds}
        title={title}
        clearButtonContent={clearButtonContent}
        onUserSelect={onUserSelect}
        onUserDeselect={onUserDeselect}
        onClear={onClear}
        onBack={onBack}
      />
    );
  },
);

BoardMembershipsStep.propTypes = {
  currentUserIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  title: PropTypes.string,
  clearButtonContent: PropTypes.string,
  onUserSelect: PropTypes.func.isRequired,
  onUserDeselect: PropTypes.func.isRequired,
  onClear: PropTypes.func,
  onBack: PropTypes.func,
};

BoardMembershipsStep.defaultProps = {
  title: undefined,
  clearButtonContent: undefined,
  onClear: undefined,
  onBack: undefined,
};

export default BoardMembershipsStep;
