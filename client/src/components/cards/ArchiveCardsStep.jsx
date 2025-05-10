/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import entryActions from '../../entry-actions';
import ConfirmationStep from '../common/ConfirmationStep';

const ArchiveCardsStep = React.memo(({ listId, onBack, onClose }) => {
  const dispatch = useDispatch();

  const handleConfirm = useCallback(() => {
    dispatch(entryActions.moveListCardsToArchiveList(listId));
    onClose();
  }, [listId, onClose, dispatch]);

  return (
    <ConfirmationStep
      title="common.archiveCards"
      content="common.areYouSureYouWantToArchiveCards"
      buttonContent="action.archiveCards"
      onConfirm={handleConfirm}
      onBack={onBack}
    />
  );
});

ArchiveCardsStep.propTypes = {
  listId: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ArchiveCardsStep.defaultProps = {
  onBack: undefined,
};

export default ArchiveCardsStep;
