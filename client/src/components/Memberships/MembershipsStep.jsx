import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { useSteps } from '../../hooks';
import ActionsStep from './ActionsStep';
import BoardMembershipsStep from '../BoardMembershipsStep';

const StepTypes = {
  EDIT: 'EDIT',
};

const MembershipsStep = React.memo(
  ({
    items,
    permissionsSelectStep,
    title,
    actionsTitle,
    leaveButtonContent,
    leaveConfirmationTitle,
    leaveConfirmationContent,
    leaveConfirmationButtonContent,
    deleteButtonContent,
    deleteConfirmationTitle,
    deleteConfirmationContent,
    deleteConfirmationButtonContent,
    canEdit,
    canLeave,
    onUpdate,
    onDelete,
    onClose,
  }) => {
    const [step, openStep, handleBack] = useSteps();

    const handleUserSelect = useCallback(
      (userId) => {
        openStep(StepTypes.EDIT, {
          userId,
        });
      },
      [openStep],
    );

    if (step && step.type === StepTypes.EDIT) {
      const currentItem = items.find((item) => item.userId === step.params.userId);

      if (currentItem) {
        return (
          <ActionsStep
            membership={currentItem}
            permissionsSelectStep={permissionsSelectStep}
            title={actionsTitle}
            leaveButtonContent={leaveButtonContent}
            leaveConfirmationTitle={leaveConfirmationTitle}
            leaveConfirmationContent={leaveConfirmationContent}
            leaveConfirmationButtonContent={leaveConfirmationButtonContent}
            deleteButtonContent={deleteButtonContent}
            deleteConfirmationTitle={deleteConfirmationTitle}
            deleteConfirmationContent={deleteConfirmationContent}
            deleteConfirmationButtonContent={deleteConfirmationButtonContent}
            canEdit={canEdit}
            canLeave={canLeave}
            onUpdate={(data) => onUpdate(currentItem.id, data)}
            onDelete={() => onDelete(currentItem.id)}
            onBack={handleBack}
            onClose={onClose}
          />
        );
      }

      openStep(null);
    }

    return (
      // FIXME: hack
      <BoardMembershipsStep
        items={items}
        currentUserIds={[]}
        title={title}
        onUserSelect={handleUserSelect}
        onUserDeselect={() => {}}
      />
    );
  },
);

MembershipsStep.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  permissionsSelectStep: PropTypes.elementType,
  title: PropTypes.string,
  actionsTitle: PropTypes.string,
  leaveButtonContent: PropTypes.string,
  leaveConfirmationTitle: PropTypes.string,
  leaveConfirmationContent: PropTypes.string,
  leaveConfirmationButtonContent: PropTypes.string,
  deleteButtonContent: PropTypes.string,
  deleteConfirmationTitle: PropTypes.string,
  deleteConfirmationContent: PropTypes.string,
  deleteConfirmationButtonContent: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
  canLeave: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

MembershipsStep.defaultProps = {
  permissionsSelectStep: undefined,
  title: undefined,
  actionsTitle: undefined,
  leaveButtonContent: undefined,
  leaveConfirmationTitle: undefined,
  leaveConfirmationContent: undefined,
  leaveConfirmationButtonContent: undefined,
  deleteButtonContent: undefined,
  deleteConfirmationTitle: undefined,
  deleteConfirmationContent: undefined,
  deleteConfirmationButtonContent: undefined,
  onUpdate: undefined,
};

export default MembershipsStep;
