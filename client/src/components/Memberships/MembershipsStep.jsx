import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import BoardMembershipsStep from '../BoardMembershipsStep/BoardMembershipsStep';
import ActionsStep from './ActionsStep';
import { Popup } from '../../lib/custom-ui';

const MembershipsStep = React.memo(
  ({
    items,
    permissionsSelectStep,
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
    const [t] = useTranslation();

    const [editingItem, setEditingItem] = useState();

    const handleUserClick = useCallback(
      (id) => {
        setEditingItem(items.find((item) => item.user.id === id));
      },
      [setEditingItem, items],
    );

    if (editingItem) {
      return (
        <>
          <Popup.Header onBack={() => setEditingItem(null)}>{t('common.memberInfo')}</Popup.Header>
          <Popup.Content>
            <ActionsStep
              membership={editingItem}
              permissionsSelectStep={permissionsSelectStep}
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
              onUpdate={onUpdate}
              onDelete={onDelete}
              onClose={onClose}
            />
          </Popup.Content>
        </>
      );
    }

    return (
      <BoardMembershipsStep
        items={items}
        currentUserIds={[]}
        onUserSelect={handleUserClick}
        onUserDeselect={() => {}}
      />
    );
  },
);

MembershipsStep.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  permissionsSelectStep: PropTypes.elementType,
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
  leaveButtonContent: 'action.leaveBoard',
  leaveConfirmationTitle: 'common.leaveBoard',
  leaveConfirmationContent: 'common.areYouSureYouWantToLeaveBoard',
  leaveConfirmationButtonContent: 'action.leaveBoard',
  deleteButtonContent: 'action.removeFromBoard',
  deleteConfirmationTitle: 'common.removeMember',
  deleteConfirmationContent: 'common.areYouSureYouWantToRemoveThisMemberFromBoard',
  deleteConfirmationButtonContent: 'action.removeMember',
  onUpdate: undefined,
};

export default MembershipsStep;
