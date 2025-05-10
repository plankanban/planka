/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { useSteps } from '../../../hooks';
import ActionsStep from './ActionsStep';
import PureBoardMembershipsStep from '../PureBoardMembershipsStep';

const StepTypes = {
  SELECT: 'SELECT',
};

const GroupItemsStep = React.memo(({ items, title, onClose }) => {
  const [step, openStep, handleBack] = useSteps();

  const handleUserClick = useCallback(
    (userId) => {
      openStep(StepTypes.SELECT, {
        userId,
      });
    },
    [openStep],
  );

  if (step && step.type === StepTypes.SELECT) {
    const currentItem = items.find((item) => item.userId === step.params.userId);

    if (currentItem) {
      return (
        <ActionsStep boardMembershipId={currentItem.id} onBack={handleBack} onClose={onClose} />
      );
    }

    openStep(null);
  }

  return <PureBoardMembershipsStep items={items} title={title} onUserSelect={handleUserClick} />;
});

GroupItemsStep.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default GroupItemsStep;
